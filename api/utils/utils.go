package utils

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"math/rand"
	"time"
)

func RandomString(length int) string {
	rand.Seed(time.Now().UnixNano())

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	b := make([]rune, length)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

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

type Response struct {
	Error    error
	Data     interface{}
	HttpCode int
}

func ErrorResponse(err error) gin.H {
	return gin.H{"error": err.Error(), "data": nil}
}

func OkResponse(data interface{}) gin.H {
	return gin.H{"error": nil, "data": data}
}

func OKResponse(data interface{}, refreshToken string) gin.H {
	return gin.H{"error": nil, "data": data, "refresh_token": refreshToken}
}
