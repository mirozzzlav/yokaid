package common

import (
	"github.com/gin-gonic/gin"
	"math/rand"
	"net/http"
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

type HttpError struct {
	HttpCode int
	Error    error
}

func CheckErrAndPanic(err error, httpCode int) {
	if err != nil {
		panic(HttpError{httpCode, err})
	}
}

func OnPanic(ctx *gin.Context, errorSetter func(ctx *gin.Context, httpCode int, err error)) {
	r := recover()
	if r == nil {
		return
	}
	if err, castingOk := r.(HttpError); castingOk {
		errorSetter(ctx, err.HttpCode, err.Error)
	}
}
