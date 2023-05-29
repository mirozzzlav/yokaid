package auth

import (
	"errors"
	"fmt"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

func getRequestForAuthorization(ctx *gin.Context, user *types.AuthUser) ([]string, error) {
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

func PolicyMiddleware(server interfaces.Server, config types.AuthPolicyConfig) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer helpers.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := errors.New(fmt.Sprintf("Problem during authorization: %s", err.Error()))
			helpers.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		m, err := model.NewModelFromString(config.Model)
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		enforcer, err := casbin.NewEnforcer(m)
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		authUser, err := GetAuthenticatedUser(ctx)
		helpers.CheckErrAndPanic(err, http.StatusUnauthorized)

		policies, err := server.GetStore().ListPoliciesAsStringArray()
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		_, err = enforcer.AddPoliciesEx(policies)
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		request, err := getRequestForAuthorization(ctx, authUser)
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		authorized, err := enforcer.Enforce(request[0], request[1], request[2], request[3])
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)

		if !authorized {
			panic(
				helpers.HttpError{
					Error:    errors.New("user is not authorized to proceed with the given request"),
					HttpCode: http.StatusUnauthorized,
				})
		}

		ctx.Next()
	}
}
