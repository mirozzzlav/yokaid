package examples

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

var errMeta = map[string]common.ResponseMeta{
	"badRequest": common.ResponseMeta{Code: http.StatusBadRequest},
}

func location(_ common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		address, addressParamExist := ctx.Params.Get("address")

		if !addressParamExist {
			panic(common.NewHttpError(nil, errMeta["badRequest"]))
		}

		common.GetLocation(address)
	}
}
