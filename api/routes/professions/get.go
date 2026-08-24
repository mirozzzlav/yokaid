package professions

import (
	"github.com/gin-gonic/gin"
	"yokaid/api/common"
)

func getProfessions(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var err error
		searchTitle, _ := ctx.Params.Get("filter")

		common.CheckErrAndPanic(err)
		lang := common.GetLangFromSession(ctx)

		app := server.GetAppService(ctx)
		err = app.Begin()
		common.CheckErrAndPanic(err)
		professions, err := app.Professions().GetProfessions(searchTitle, lang)
		common.CheckErrAndPanic(err)
		err = app.Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", professions)
	}
}
