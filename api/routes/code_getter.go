package routes

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func getCode(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		httpError := common.NewHttpError(
			nil, common.ResponseMeta{
				Code: http.StatusBadRequest,
				Msg: `We are unable to send an SMS code to your phone at the moment. 
						Please double-check the phone number you entered, and try again.`,
			})

		phone, paramExists := ctx.Params.Get("phone")
		if !paramExists {
			panic(httpError)
		}

		isPhoneValid := common.ValidatePhoneNumber(phone)
		if !isPhoneValid {
			panic(httpError)
		}

		code := common.RandomStringWithCharset(6, "0123456789")
		// send code to user phone by SMS API

		server.GetQueryRunner(ctx).Begin()
		err := server.GetStoreHelpers(ctx).AddOrUpdateVerification(code, phone)
		if err == common.ErrNoRows {
			panic(
				common.NewHttpError(
					nil,
					common.ResponseMeta{Code: http.StatusBadRequest, Msg: "Unknown error, please try to get your code again."},
				),
			)
		}
		common.CheckErrAndPanic(err)
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "Verification successful.")

	}
}
