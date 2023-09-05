package examples

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/auth"
	"some-app/api/common"
)

var errPassword = map[string]common.ResponseMeta{
	"badRequest": common.ResponseMeta{Code: http.StatusBadRequest},
}

func password(_ common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		passwd, passwordParamExist := ctx.Params.Get("password")

		if !passwordParamExist {
			panic(common.NewHttpError(nil, errPassword["badRequest"]))
		}

		hashPassword, _ := auth.HashPassword(passwd)
		common.SetOKJSONResponse(ctx, hashPassword)
	}
}
