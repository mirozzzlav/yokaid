package auth

import (
	"encoding/json"
	"errors"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"strings"
)

const (
	headerKey  = "auth"
	typeBearer = "bearer"
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
		return []string{user.Username, user.Role, action, ctx.Request.URL.Path}, nil
	}

	return []string{}, nil

}

func checkPolicies(server common.Server, ctx *gin.Context, authUser common.AuthUser) (error, bool) {
	m, err := model.NewModelFromString(common.Config.Policy.Model)
	if err != nil {
		return err, false
	}

	enforcer, err := casbin.NewEnforcer(m)
	if err != nil {
		return err, false
	}

	policies, policiesModelLoader := common.PoliciesModelLoader()

	err = server.GetQueryRunner(ctx).GetRowsAsArrayOfArrays(server.GetQueriesRepo().ListPoliciesQuery(), policiesModelLoader)
	if err != nil {
		return err, false
	}

	_, err = enforcer.AddPoliciesEx(*policies)
	if err != nil {
		return err, false
	}

	request, err := getRequestForAuthorization(ctx, authUser)
	if err != nil {
		return err, false
	}

	authorized, err := enforcer.Enforce(request[0], request[1], request[2], request[3])
	if err != nil {
		return err, false
	}

	if !authorized {
		return nil, false
	}
	return nil, true
}

func getRequestToken(ctx *gin.Context) (string, error) {

	authHeader := ctx.GetHeader(headerKey)
	fields := strings.Fields(authHeader)
	if len(fields) < 2 || strings.ToLower(fields[0]) != typeBearer {
		return "", errors.New("token has wrong format")
	}

	return fields[1], nil
}

func addTokenToResponse(ctx *gin.Context, accessToken string) error {
	tokenBytes, err := json.Marshal(map[string]any{"refresh_token": accessToken})

	if err != nil {
		return err
	}

	_, err = ctx.Writer.Write(tokenBytes)
	return err
}

func Middleware(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if !server.IsPrivateRoute(ctx.FullPath()) {
			ctx.Next()
			return
		}
		accessToken, err := getRequestToken(ctx)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized})

		payload, err := server.GetTokenMaker().VerifyToken(accessToken, common.Config.AccessTokenDuration)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized})

		err, userPassedPolicy := checkPolicies(server, ctx, payload.User)
		common.CheckErrAndPanic(err)

		if !userPassedPolicy {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusUnauthorized}))
		}

		server.SetAuthUser(payload.User)
		freshToken, err := getFreshToken(server)
		common.CheckErrAndPanic(err)

		ctx.Next()
		err = addTokenToResponse(ctx, freshToken)
		common.CheckErrAndPanic(err)
	}
}
