package contact_form

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
	"yokaid/api/send_service"
)

func processContactForm(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		var req common.ContactFormRequest
		_ = ctx.BindJSON(&req)

		err := server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		message, err := send_service.GetMailContactFormRequest(map[string]string{
			"message": req.Message,
			"from":    req.From,
		})
		common.CheckErrAndPanic(err)

		err = send_service.SendMail(common.Config.SupportMail, message, "Contact form request")

		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "contact form success")

	}
}

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/contact-form/process", http.MethodPost, processContactForm(server)),
	}
}
