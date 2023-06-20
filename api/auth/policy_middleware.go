package auth

import (
	"errors"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

func getRequestForAuthorization(ctx *gin.Context, user common.AuthUser) ([]string, error) {
	actionsMap := map[string]string{
		http.MethodGet:    "read",
		http.MethodPost:   "create",
		http.MethodPut:    "update",
		http.MethodDelete: "delete",
	}
	action, exists := actionsMap[ctx.Request.Method]
	if exists {
		return []string{user.Username, user.Role, action, ctx.FullPath()}, nil
	}

	return []string{}, nil

}

func PolicyMiddleware(server common.Server, config common.AuthPolicyConfig) gin.HandlerFunc {
	internalErr := errors.New("internal error while authorizing user")
	return func(ctx *gin.Context) {
		if !server.IsPrivateRoute(ctx.FullPath()) {
			ctx.Next()
			return
		}

		m, err := model.NewModelFromString(config.Model)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		enforcer, err := casbin.NewEnforcer(m)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		authUser, err := server.GetAuthUser()
		common.CheckErrAndPanic(err, http.StatusUnauthorized, common.AuthErr)

		policies, policiesFiller := common.PoliciesFiller()
		err = server.GetStore().ListPolicies(policiesFiller)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		_, err = enforcer.AddPoliciesEx(*policies)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		request, err := getRequestForAuthorization(ctx, authUser)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		authorized, err := enforcer.Enforce(request[0], request[1], request[2], request[3])
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		if !authorized {
			panic(common.NewHttpError(common.AuthErr, http.StatusUnauthorized, nil))
		}

		ctx.Next()
	}
}
