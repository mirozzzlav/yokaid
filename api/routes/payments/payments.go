package payments

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
)

func makePayment(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		doMakePayment := func(code string) {
			app := server.GetAppService(ctx)
			err := app.Begin()
			common.CheckErrAndPanic(err)

			err = app.Payments().MakePayment(code)
			if err == common.ErrNoRows {
				panic(common.HttpResponse{
					Code: http.StatusBadRequest,
					Body: common.HttpResponseBody{
						Msg:  "your sms code is not valid",
						Data: nil,
					},
				})
			}
			common.CheckErrAndPanic(err)

			err = app.Commit()
			common.CheckErrAndPanic(err)

		}

		var code string
		successMsg := "payment successful"
		if ctx.Request.Method == http.MethodPost {
			if common.Config.PayReview != "verify" {
				panic(common.HttpResponse{
					Code: http.StatusUnauthorized,
					Body: common.HttpResponseBody{
						Msg:  "SMS verification is not allowed.",
						Data: nil,
					},
				})
			}
			var req common.MakePaymentRequest
			_ = ctx.BindJSON(&req)
			code = req.Code
			successMsg = "verification successful"
		}

		if ctx.Request.Method == http.MethodGet {
			// TODO check payment token
			var ok bool
			if code, ok = ctx.Params.Get("code"); ok == false {
				panic(common.GetHttpResponseFromError(common.ErrBadInputs))
			}
		}

		doMakePayment(code)
		common.SetOKJSONResponse(ctx, successMsg)

	}
}

func GetRoutes(server common.Server) []common.Route {
	return []common.Route{
		common.NewRoute("/payments/make", http.MethodPost, makePayment(server)),
		common.NewRoute("/payments/make/:code", http.MethodGet, makePayment(server)),
	}
}
