package common

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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

func SetOKJSONResponse(ctx *gin.Context, data any) {
	ctx.JSON(
		http.StatusOK,
		gin.H{
			"error": nil,
			"data":  data,
		},
	)
}

func SetErrorJSONResponse(ctx *gin.Context, httpCode int, errMsg string, data ...any) {
	var _data any = nil
	if data != nil {
		_data = data[0]
	}
	ctx.AbortWithStatusJSON(httpCode, gin.H{
		"error": map[string]any{
			"msg":        errMsg,
			"extra_data": _data,
		},
		"data": nil,
	})
}

func GetValidationErrors(errors any) []map[string]any {
	validationErrors, haveValidationErrors := errors.(validator.ValidationErrors)
	if !haveValidationErrors {
		return nil
	}

	var res []map[string]any
	for _, e := range validationErrors {
		mappedErr := map[string]any{
			"field":     e.StructField(),
			"validator": e.Tag(),
		}
		res = append(res, mappedErr)
	}
	return res
}

func NewHttpError(err error, responseMeta ...ResponseMeta) HttpError {

	var _responseMeta ResponseMeta

	if responseMeta == nil {
		_responseMeta = ResponseMeta{
			Code:      http.StatusInternalServerError,
			ExtraData: nil,
		}
	} else {
		_responseMeta = responseMeta[0]
		if _responseMeta.Code == 0 { // if not filled in
			_responseMeta.Code = http.StatusInternalServerError
		}
		if _responseMeta.Msg == "" {
			_responseMeta.Msg = "hoops, internal server error give it an other try"

			if _responseMeta.Code == http.StatusUnauthorized {
				_responseMeta.Msg = "user is not authorized for the given request"
			}

			if _responseMeta.Code == http.StatusBadRequest {
				_responseMeta.Msg = "bad request, given inputs are not valid"
			}

			if _responseMeta.Code == http.StatusNotFound {
				_responseMeta.Msg = "page not found"
			}
		}
	}
	return HttpError{
		Error:        err,
		ResponseMeta: _responseMeta,
	}
}

func CheckErrAndPanic(err error, respMeta ...ResponseMeta) {
	if err != nil {
		panic(NewHttpError(err, respMeta...))
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

func ToPascalCase(snakeCase string) string {
	re := regexp.MustCompile("_[a-z]")

	// Use a closure to replace the capturing group with its uppercase version
	result := re.ReplaceAllStringFunc(snakeCase[1:], func(match string) string {
		return strings.ToUpper(match[1:])
	})

	return strings.ToUpper(snakeCase[0:1]) + result
}
