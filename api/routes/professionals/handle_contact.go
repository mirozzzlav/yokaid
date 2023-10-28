package professionals

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func handleProfessionalContact(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.PaymentRequest
		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		q := server.GetQueriesRepo().GetProfessionalContactQuery(req.EntityId, req.UserPhone)
		contacts, contactsModelLoader := common.ContactsModelLoader()

		err = server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).GetRows(q, contactsModelLoader)
		common.CheckErrAndPanic(err)

		if len(*contacts) == 0 {
			q = server.GetQueriesRepo().CreatePaymentQuery(req)
			requestId, err := server.GetQueryRunner(ctx).Exec(q, "request_id")
			common.CheckErrAndPanic(err)

			err = server.GetQueryRunner(ctx).Commit()
			common.CheckErrAndPanic(err)

			common.SetOKJSONResponse(ctx, "", map[string]any{
				"contact": nil,
				"code":    fmt.Sprintf("con%d", requestId),
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
