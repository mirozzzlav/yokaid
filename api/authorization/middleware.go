package authorization

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/utils"
	"strings"
	"time"
)

const (
	HeaderKey  = "authorization"
	TypeBearer = "bearer"
	PayloadKey = "authorization_payload"
)

func GetRequestToken(ctx *gin.Context) (string, error) {

	authorizationHeader := ctx.GetHeader(HeaderKey)
	fields := strings.Fields(authorizationHeader)
	if len(fields) < 2 {
		return "", ErrInvalidToken
	}
	authorizationType := strings.ToLower(fields[0])

	if len(authorizationHeader) == 0 || len(fields) < 2 || authorizationType != TypeBearer {
		return "", ErrInvalidToken
	}

	return fields[1], nil
}

// AuthMiddleware creates a gin middleware for authorization
func AuthMiddleware(tokenMaker Maker, tokenDuration time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessToken, error := GetRequestToken(ctx)
		if error != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.ErrorResponse(error))
		}
		payload, err := tokenMaker.VerifyToken(accessToken, tokenDuration)

		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.ErrorResponse(err))
			return
		}

		ctx.Set(PayloadKey, payload)
		ctx.Next()
	}
}
