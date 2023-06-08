package common

import (
	"github.com/gin-gonic/gin"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strings"
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

func GetJSONResponse(err error, data any) gin.H {
	if err != nil {
		return gin.H{
			"error": err.Error(),
			"data":  data,
		}
	}
	return gin.H{
		"error": nil,
		"data":  data,
	}
}

func SetOKJSONResponse(ctx *gin.Context, data any) {
	ctx.JSON(http.StatusOK, GetJSONResponse(nil, data))
}

func SetErrorJSONResponse(ctx *gin.Context, httpCode int, err error) {
	ctx.AbortWithStatusJSON(httpCode, GetJSONResponse(err, nil))
}

func CheckErrAndPanic(err error, httpCode int, outputErr error) {
	if outputErr == nil {
		outputErr = err
	}
	if err != nil {
		panic(HttpError{HttpCode: httpCode, Error: err, OutputError: outputErr})
	}
}

func StripTags(text string) string {

	r, err := regexp.Compile("<[^>]*>")
	if err != nil {
		panic(err)
	}

	return r.ReplaceAllString(text, "")
}

func GetEnvMode() string {
	args := os.Args[1:] // Exclude the program name

	// Parse command-line arguments
	params := make(map[string]string)
	for _, arg := range args {
		parts := strings.SplitN(arg, "=", 2)
		if len(parts) == 2 {
			params[parts[0]] = parts[1]
		}
	}
	// Access specific parameters
	mode, modeExists := params["mode"]
	if modeExists {
		return mode
	}
	return "development" // default if nothing set
}
