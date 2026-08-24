package professions

import (
	"github.com/gin-gonic/gin"
	"yokaid/api/common"
)

func getProfessions(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		searchTitle, _ := ctx.Params.Get("filter")

		lang := common.GetLangFromSession(ctx)

		app := server.GetAppService(ctx)
		professions, err := app.Professions().GetProfessions(searchTitle, lang)
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", professions)
	}
}
