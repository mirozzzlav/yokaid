package payments

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func makePayment(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		code, paramExist := ctx.Params.Get("code")
		if !paramExist {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		q := server.GetQueriesRepo().MakePaymentQuery(code)

		err := server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		_, err = server.GetQueryRunner(ctx).Exec(q)
		if err == common.ErrNoRows {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		common.CheckErrAndPanic(err)

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "payment successful")
	}
}

func GetRoutes(server common.Server) []common.Route {
	return []common.Route{
		common.NewRoute("/payments/make", http.MethodGet, makePayment(server)),
		common.NewRoute("/payments/make/:code", http.MethodGet, makePayment(server)),
	}
}
