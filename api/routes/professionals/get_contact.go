package professionals

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func getProfessionalContact(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		professionalIdStr, _ := ctx.Params.Get("professionalId")
		professionalId, _ := common.ConvertToInt(professionalIdStr)
		userPhone, _ := ctx.Params.Get("userPhone")

		err := server.GetValidate().Struct(common.GetCodeRequest{
			EntityId:    professionalId,
			PaymentType: "con",
			UserPhone:   userPhone,
		})
		common.CheckErrAndPanic(err)

		q := server.GetQueriesRepo().GetProfessionalContactQuery(professionalId, userPhone)
		contacts, contactsModelLoader := common.ContactsModelLoader()

		err = server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).GetRows(q, contactsModelLoader)
		common.CheckErrAndPanic(err)

		if len(*contacts) == 0 {
			q = server.GetQueriesRepo().CreatePaymentQuery(common.GetCodeRequest{
				UserPhone:   userPhone,
				PaymentType: "con",
				EntityId:    professionalId,
			})
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
