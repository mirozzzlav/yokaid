package codes

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func getCode(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		paymentType, paramExist := ctx.Params.Get("paymentType")
		if !paramExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}

		entityIdStr, paramExist := ctx.Params.Get("entityId")
		if !paramExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}

		entityId, err := common.ConvertToInt(entityIdStr)
		if err != nil {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}

		userPhone, _ := ctx.Params.Get("userPhone")

		if !common.ValidatePhoneNumber(userPhone) {
			panic(common.NewHttpError(nil, common.ResponseMeta{
				Code: http.StatusBadRequest,
				Msg:  "User phone is empty or not in valid format.",
			}))
		}

		err = server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetStoreHelpers(ctx).CreatePayment(userPhone, paymentType, entityId)
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(
			ctx,
			map[string]string{"code": paymentType + entityIdStr},
		)
	}
}
