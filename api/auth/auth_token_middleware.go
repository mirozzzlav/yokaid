package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"strings"
	"time"
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

// AuthTokenMiddleware creates a gin middleware for auth
func AuthTokenMiddleware(tokenMaker interfaces.Maker, tokenDuration time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessToken, error := GetRequestToken(ctx)
		if error != nil {
			helpers.SetErrorJSONResponse(ctx, http.StatusUnauthorized, error)
			return
		}
		payload, error := tokenMaker.VerifyToken(accessToken, tokenDuration)

		if error != nil {
			helpers.SetErrorJSONResponse(ctx, http.StatusUnauthorized, error)
			return
		}
		ctx.Set(PayloadKey, payload)
		ctx.Next()
	}
}
