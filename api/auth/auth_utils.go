package auth

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

// HashPassword returns the bcrypt hash of the password
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

// CheckPassword checks if the provided password is correct or not
func CheckPassword(password string, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func GetAuthenticatedUser(ctx *gin.Context) (*types.AuthUser, error) {
	payloadRaw, exists := ctx.Get(PayloadKey)
	if !exists {
		return nil, errors.New("user is not authenticated")
	}
	payload := payloadRaw.(*types.AuthPayload)
	return &payload.User, nil
}

func GetFreshToken(ctx *gin.Context, server interfaces.Server) (string, error) {
	genericError := errors.New("problem with refresh token creation")
	authUser, err := GetAuthenticatedUser(ctx)
	if err != nil {
		return "", genericError
	}
	refreshToken, err := server.GetTokenMaker().CreateToken(*authUser)
	if err != nil {
		return "", genericError
	}
	return refreshToken, nil

}
