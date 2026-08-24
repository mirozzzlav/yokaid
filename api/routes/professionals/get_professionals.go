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
		filter, _ := ctx.Params.Get("filter")

		lang := common.GetLangFromSession(ctx)
		app := server.GetAppService(ctx)
		err := app.Begin()
		common.CheckErrAndPanic(err)
		pros, err := app.Professionals().GetProfessionals(filter, lang)
		common.CheckErrAndPanic(err)
		err = app.Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", pros)
	}
}

func searchProfessional(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		searchName, _ := ctx.Params.Get("searchName")

		lang := common.GetLangFromSession(ctx)
		app := server.GetAppService(ctx)
		err := app.Begin()
		common.CheckErrAndPanic(err)
		professionals, err := app.Professionals().SearchProfessionals(searchName, lang)
		common.CheckErrAndPanic(err)
		err = app.Commit()
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
		professionalIdStr, paramExist := ctx.Params.Get("professionalId")
		if !paramExist {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		professionalId, err := common.ConvertToInt(professionalIdStr)
		if err != nil {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}

		app := server.GetAppService(ctx)
		err = app.Begin()
		common.CheckErrAndPanic(err)
		userId := ""

		if common.Config.PayContact != "" {
			userId, _ = ctx.Params.Get("userId")
			hasContact, err := app.Contacts().HasUnlockedContact(professionalId, common.UserId(userId))
			if err != nil {
				common.CheckErrAndPanic(err)
			}
			if !hasContact {
				userId = ""
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
		professional, err := app.Professionals().GetProfessionalDetail(
			professionalId,
			reviewsPage,
			userId,
			lang,
		)

		common.CheckErrAndPanic(err)
		err = app.Commit()
		common.CheckErrAndPanic(err)
		if professional != nil {
			reviews := professional.Reviews
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

			professional.Reviews = reviews
			common.SetOKJSONResponse(ctx, "", professional)
		} else {
			common.SetOKJSONResponse(ctx, "", nil)
		}

	}
}
