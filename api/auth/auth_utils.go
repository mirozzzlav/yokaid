package auth

import (
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"rental-app/api/common"
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

func getFreshToken(server common.Server) (string, error) {
	genericError := errors.New("problem with refresh token creation")
	authUser := server.GetAuthUser()
	if authUser == nil {
		return "", genericError
	}
	refreshToken, err := server.GetTokenMaker().CreateToken(*authUser)
	if err != nil {
		return "", genericError
	}
	return refreshToken, nil

}
