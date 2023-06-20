package professionals

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"rental-app/api/db"
)

func list(server common.Server) gin.HandlerFunc {
	internalErr := errors.New("error occurred while getting professionals list")
	return func(ctx *gin.Context) {
		pros, prosFiller := common.ProfessionalsFiller()
		var err error
		filter, _ := ctx.Params.Get("filter")

		q, err := db.GetJoinedPartial(db.FilterQueryPartialProcessor{Filter: filter})
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		dbQuery := db.ListProfessionalsQuery(q)
		err = server.GetQueryRunner().GetRows(dbQuery, prosFiller)

		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		common.SetOKJSONResponse(ctx, pros)
	}
}
