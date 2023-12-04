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

		err = server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		paymentId, err := server.GetStoreHelpers(ctx).CreateProfessionalContactWithPayment(req, common.PaymentStates.New)
		if err == common.ErrRecordExist {
			q := server.GetQueriesRepo().GetProfessionalContactQueryByPaymentIdQuery(paymentId)
			contacts, contactsModelLoader := common.ContactsModelLoader()
			err = server.GetQueryRunner(ctx).GetRows(q, contactsModelLoader)
			common.CheckErrAndPanic(err)

			common.SetOKJSONResponse(
				ctx,
				"",
				map[string]any{
					"contact": (*contacts)[0],
					"code":    "",
				},
			)
		}
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()

		common.SetOKJSONResponse(ctx, "", map[string]any{
			"contact": nil,
			"code":    paymentId,
		})
		return
	}

}
