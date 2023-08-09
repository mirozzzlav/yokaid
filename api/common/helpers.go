package common

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"math/rand"
	"net/http"
	"os"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

func randomString(length int, charset string) string {
	var charsetRune = []rune(charset)

	b := make([]rune, length)
	for i := range b {
		b[i] = charsetRune[rand.Intn(len(charsetRune))]
	}
	return string(b)
}

func RandomString(length int) string {
	return randomString(length, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#$.!@")
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
			ExtraData: nil,
		}
		if err == ErrNoRows {
			_responseMeta.Code = http.StatusBadRequest
			_responseMeta.Msg = "no results found for the given request"
		}
	} else {
		_responseMeta = responseMeta[0]
	}

	if _responseMeta.Code == 0 { // if not filled in
		_responseMeta.Code = http.StatusInternalServerError
	}

	if _responseMeta.Msg != "" {
		return HttpError{
			Error:        err,
			ResponseMeta: _responseMeta,
		}
	}

	if _responseMeta.Code == http.StatusInternalServerError {
		_responseMeta.Msg = "hoops, internal server error give it an other try"
	}

	if _responseMeta.Code == http.StatusUnauthorized {
		_responseMeta.Msg = "user is not authorized for the given request"
	}

	if _responseMeta.Code == http.StatusBadRequest {
		_responseMeta.Msg = "bad request, given inputs are not valid"
	}

	if _responseMeta.Code == http.StatusNotFound {
		_responseMeta.Msg = "page not found"
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

func PublicRolesValidator(fl validator.FieldLevel) bool {
	fieldValue := fl.Field().String()

	for _, allowedValue := range publicRoles {
		if fieldValue == allowedValue {
			return true
		}
	}

	return false
}

func StringValidator(fl validator.FieldLevel) bool {
	return fl.Field().Kind() == reflect.String
}

func PasswordValidator(fl validator.FieldLevel) bool {

	if fl.Field().Kind() != reflect.String {
		return false
	}
	password := fl.Field().String()

	num, upper, special := 0, 0, 0
	for _, c := range password {
		switch {
		case unicode.IsNumber(c):
			num++
		case unicode.IsUpper(c):
			upper++
		case unicode.IsPunct(c) || unicode.IsSymbol(c):
			special++
		}
	}
	return num > 0 && upper > 0 && special > 0 && len(password) >= 8
}

func MultiWordsValidator(fl validator.FieldLevel) bool {
	if fl.Field().Kind() != reflect.String {
		return false
	}
	text := fl.Field().String()
	if len(text) < 3 {
		return false
	}

	textSplits := regexp.MustCompile(`\s[a-zA-Z]`).Split(text, -1)
	return len(textSplits) >= 2
}

func ConvertToInt(val any) (int, error) {
	switch v := val.(type) {
	case int:
		return v, nil
	case int8:
		return int(v), nil
	case int16:
		return int(v), nil
	case int32:
		return int(v), nil
	case int64:
		return int(v), nil
	case uint:
		return int(v), nil
	case uint8:
		return int(v), nil
	case uint16:
		return int(v), nil
	case uint32:
		return int(v), nil
	case uint64:
		return int(v), nil
	case float32:
		return int(v), nil
	case float64:
		return int(v), nil
	case string:
		num, err := strconv.Atoi(v)
		if err != nil {
			return 0, err
		}
		return num, nil
	default:
		return 0, fmt.Errorf("conversion failed")
	}
}

func IsNumeric(s string) bool {
	_, err := strconv.ParseFloat(s, 64)
	return err == nil
}

func IsFloat(s string) bool {
	return IsNumeric(s) && strings.Contains(s, ".")
}

func SetStoreHelpers(
	ctx *gin.Context,
	storeHelpers StoreHelpers,
) {
	ctx.Set("storeHelpers", &storeHelpers)
}

func GetStoreHelpers(ctx *gin.Context) StoreHelpers {
	sH, sHExist := ctx.Get("storeHelpers")
	if !sHExist {
		return nil
	}
	return *(sH.(*StoreHelpers))
}
