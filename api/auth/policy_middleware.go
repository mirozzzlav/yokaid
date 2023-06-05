package auth

import (
	"errors"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"rental-app/api/common"
)

func getRequestForAuthorization(ctx *gin.Context, user *common.AuthUser) ([]string, error) {
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
	authErr := errors.New("user is not authorized to proceed with the given request")
	return func(ctx *gin.Context) {
		defer common.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := authErr
			log.Printf("Err: %v", err)
			if httpCode == http.StatusInternalServerError {
				resultErr = errors.New("internal error while authorizing user")
			}
			common.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		m, err := model.NewModelFromString(config.Model)
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		enforcer, err := casbin.NewEnforcer(m)
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		authUser, err := GetAuthenticatedUser(ctx)
		common.CheckErrAndPanic(err, http.StatusUnauthorized)

		policies, err := server.GetStore().ListPoliciesAsStringArray()
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		_, err = enforcer.AddPoliciesEx(policies)
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		request, err := getRequestForAuthorization(ctx, authUser)
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		authorized, err := enforcer.Enforce(request[0], request[1], request[2], request[3])
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		if !authorized {
			panic(
				common.HttpError{
					Error:    authErr,
					HttpCode: http.StatusUnauthorized,
				})
		}

		ctx.Next()
	}
}
