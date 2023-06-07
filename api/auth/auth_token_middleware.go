package auth

import (
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"strings"
)

const (
	headerKey  = "auth"
	typeBearer = "bearer"
)

var tokenError = errors.New("auth token problem has occurred")

func getRequestToken(ctx *gin.Context) (string, error) {

	authHeader := ctx.GetHeader(headerKey)
	fields := strings.Fields(authHeader)
	if len(fields) < 2 || strings.ToLower(fields[0]) != typeBearer {
		return "", errors.New("token has wrong format")
	}

	return fields[1], nil
}

func TokenMiddleware(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if !server.IsPrivateRoute(ctx.FullPath()) {
			ctx.Next()
			return
		}
		accessToken, err := getRequestToken(ctx)
		common.CheckErrAndPanic(err, http.StatusUnauthorized, tokenError)
		payload, err := server.GetTokenMaker().VerifyToken(accessToken, server.GetConfig().AccessTokenDuration)

		common.CheckErrAndPanic(err, http.StatusUnauthorized, tokenError)
		server.SetAuthUser(payload.User)
		tokenBytes, err := json.Marshal(map[string]any{"refresh_token": accessToken})
		common.CheckErrAndPanic(err, http.StatusUnauthorized, tokenError)
		ctx.Writer.Write(tokenBytes)
		ctx.Next()
	}
}
