package professionals

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"yokaid/api/common"
)

func getProfessionals(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pros, prosModelLoader := common.ProfessionalsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := server.GetStoreHelpers(ctx).HandleFilter(filter)
		common.CheckErrAndPanic(err)

		lang := common.GetLangFromSession(ctx)
		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(filterQP, lang, -1)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", pros)
	}
}

func searchProfessional(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		professionals, professionalsModelLoader := common.ProfessionalsModelLoader()
		var err error
		searchName, _ := ctx.Params.Get("searchName")

		common.CheckErrAndPanic(err)
		lang := common.GetLangFromSession(ctx)
		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{
				Query:  "unaccent(full_name) ILIKE unaccent(?)",
				Params: []any{"%" + searchName + "%"},
			}, lang, 5)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, professionalsModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", professionals)
	}
}

func getMedia(mediaFolderIds []string) (common.HttpResponse, error) {

	defaultErrResp := common.HttpResponse{
		Code: http.StatusInternalServerError,
		Body: common.HttpResponseBody{
			Msg: "Problem occurred while getting the media",
		},
	}
	url := fmt.Sprintf(
		"http://%s/media/list/[%s]", common.Config.MediaStoreUrl, strings.Join(mediaFolderIds, ","),
	)
	response, err := http.Get(url)

	if err != nil {
		return defaultErrResp, err
	}
	defer response.Body.Close()

	var respBody common.HttpResponseBody
	err = json.NewDecoder(response.Body).Decode(&respBody)

	if err != nil {
		return defaultErrResp, err
	}

	if response.StatusCode != http.StatusOK {
		err = errors.New(defaultErrResp.Body.Msg)
	}

	return common.HttpResponse{
		Code: response.StatusCode,
		Body: respBody,
	}, err

}

func getProfessionalDetail(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var dbQuery common.Query
		pros, prosModelLoader := common.ProfessionalsModelLoader()

		professionalIdStr, paramExist := ctx.Params.Get("professionalId")
		if !paramExist {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		professionalId, err := common.ConvertToInt(professionalIdStr)
		if err != nil {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}

		server.GetQueryRunner(ctx).Begin()
		userId := ""

		if common.Config.PayContact != "" {
			userId, _ = ctx.Params.Get("userId")
			dbQuery = server.GetQueriesRepo().GetProfessionalContactQuery(professionalId, common.UserId(userId), "1")
			_, err = server.GetQueryRunner(ctx).GetScalar(dbQuery)
			if err == common.ErrNoRows {
				userId = ""
			} else {
				common.CheckErrAndPanic(err)
			}
		}

		reviewsPage := 1
		if reviewsPageStr, ok := ctx.Params.Get("reviewsPage"); ok {
			reviewsPage, err = common.ConvertToInt(reviewsPageStr)
			if err != nil {
				panic(common.GetHttpResponseFromError(common.ErrBadInputs))
			}
		}
		lang := common.GetLangFromSession(ctx)
		dbQuery = server.GetQueriesRepo().GetProfessionalDetailQuery(
			professionalId,
			reviewsPage,
			userId,
			lang,
		)

		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		if pros != nil && len(*pros) > 0 {
			reviews := (*pros)[0].Reviews
			var mediaFolderIds []string
			for _, r := range reviews {
				if r.MediaFolderId != nil {
					mediaFolderIds = append(mediaFolderIds, *r.MediaFolderId)
				}
			}

			if mediaFolderIds != nil {
				mediaResp, err := getMedia(mediaFolderIds)
				if err != nil {
					panic(mediaResp)
				}

				for i, r := range reviews {
					if r.MediaFolderId == nil {
						continue
					}
					var imagesMap map[string][]string
					marshaled, _ := json.Marshal(mediaResp.Body.Data)
					json.Unmarshal(marshaled, &imagesMap)
					images, _ := imagesMap[*r.MediaFolderId]
					reviews[i].Images = &images
				}
			}

			common.SetOKJSONResponse(ctx, "", (*pros)[0])
		} else {
			common.SetOKJSONResponse(ctx, "", nil)
		}

	}
}
