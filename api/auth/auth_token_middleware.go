package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"strings"
)

const (
	HeaderKey  = "auth"
	TypeBearer = "bearer"
	PayloadKey = "authentication_payload"
)

func GetRequestToken(ctx *gin.Context) (string, error) {

	authHeader := ctx.GetHeader(HeaderKey)
	fields := strings.Fields(authHeader)
	if len(fields) < 2 || strings.ToLower(fields[0]) != TypeBearer {
		return "", ErrInvalidToken
	}

	return fields[1], nil
}

func TokenMiddleware(server interfaces.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessToken, error := GetRequestToken(ctx)
		if error != nil {
			helpers.SetErrorJSONResponse(ctx, http.StatusUnauthorized, error)
			return
		}
		payload, error := server.GetTokenMaker().VerifyToken(accessToken, server.GetConfig().AccessTokenDuration)

		if error != nil {
			helpers.SetErrorJSONResponse(ctx, http.StatusUnauthorized, error)
			return
		}
		ctx.Set(PayloadKey, payload)
		ctx.Next()
	}
}
