package professionals

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func handleProfessionalContact(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateUserProfessionalContactRequest
		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		q := server.GetQueriesRepo().GetProfessionalContactQuery(req.ProfessionalId, req.UserId)
		contacts, contactsModelLoader := common.ContactsModelLoader()

		err = server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).GetRows(q, contactsModelLoader)
		common.CheckErrAndPanic(err)

		if len(*contacts) == 0 {
			q = server.GetQueriesRepo().CreatePaymentQuery(common.GenerateUniqueID(), req.UserId, "con")
			paymentIdAny, err := server.GetQueryRunner(ctx).Exec(q)
			common.CheckErrAndPanic(err)

			paymentId, _ := paymentIdAny.(string)
			q = server.GetQueriesRepo().CreateProfessionalContactQuery(paymentId, req)
			_, err = server.GetQueryRunner(ctx).Exec(q)
			common.CheckErrAndPanic(err)

			err = server.GetQueryRunner(ctx).Commit()
			common.CheckErrAndPanic(err)

			common.SetOKJSONResponse(ctx, "", map[string]any{
				"contact": nil,
				"code":    paymentId,
			})
			return
		}

		err = server.GetQueryRunner(ctx).Commit()
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

}
