package professionals

import (
	"github.com/gin-gonic/gin"
	"yokaid/api/common"
)

func handleProfessionalContact(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateUserProfessionalContactRequest
		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)

		app := server.GetAppService(ctx)
		err = app.Begin()
		common.CheckErrAndPanic(err)

		paymentId, err := app.Contacts().CreateProfessionalContactWithPayment(req, common.PaymentStates.New)
		if err == common.ErrRecordExist {
			contacts, err := app.Contacts().GetUnlockedContactByPaymentId(paymentId)
			common.CheckErrAndPanic(err)

			common.SetOKJSONResponse(
				ctx,
				"",
				map[string]any{
					"contact": contacts[0],
					"code":    "",
				},
			)
		}
		common.CheckErrAndPanic(err)
		err = app.Commit()

		common.SetOKJSONResponse(ctx, "", map[string]any{
			"contact": nil,
			"code":    paymentId,
		})
		return
	}

}
