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
			"msg":       errMsg,
			"extraData": _data,
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
			"field":     ToCamelCase(e.StructField()),
			"validator": ToCamelCase(e.Tag()),
			"param":     ToCamelCase(e.Param()),
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
			_responseMeta.Code = http.StatusNoContent
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
		_responseMeta.Msg = "invalid request, please check your inputs"
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

func ToSnakeCase(pascalOrCamel string) string {
	if pascalOrCamel == "" {
		return ""
	}
	camelCase := strings.ToLower(pascalOrCamel[0:1]) + pascalOrCamel[1:]
	re := regexp.MustCompile("([a-z])([A-Z])")

	result := re.ReplaceAllStringFunc(camelCase, func(match string) string {
		return match[0:1] + "_" + strings.ToLower(match[1:])
	})

	return result
}

func ToCamelCase(snakeOrPascal string) string {
	if snakeOrPascal == "" {
		return ""
	}
	snakeCase := ToSnakeCase(snakeOrPascal)
	re := regexp.MustCompile("_[a-z]")

	result := re.ReplaceAllStringFunc(snakeCase[1:], func(match string) string {
		return strings.ToUpper(match[1:])
	})

	return strings.ToLower(snakeCase[0:1]) + result
}

// ToPascalCase big char first -- HelloWorldThisIsCool
func ToPascalCase(snakeOrCamel string) string {
	if snakeOrCamel == "" {
		return ""
	}
	camel := ToCamelCase(snakeOrCamel)
	return strings.ToUpper(camel[0:1]) + camel[1:]
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

func PhoneNumberValidator(fl validator.FieldLevel) bool {
	return regexp.MustCompile(`(?:\+|00)[0-9]{12}|[0-9]{10}`).MatchString(fl.Field().String())
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

func mergeStringMaps(map1, map2 map[string]string) map[string]string {
	merged := make(map[string]string)

	for key, value := range map1 {
		merged[key] = value
	}

	for key, value := range map2 {
		merged[key] = value
	}

	return merged
}

func getStructValidationRules(structInstance any) (map[string]string, error) {
	structType := reflect.TypeOf(structInstance)
	var validationRules = map[string]string{}

	for i := 0; i < structType.NumField(); i++ {
		field := structType.Field(i)
		fieldName := strings.ToLower(field.Name[0:1]) + field.Name[1:]
		if field.Type.Kind() == reflect.Struct {
			fieldInstance := reflect.New(field.Type).Elem().Interface()
			nestedValidationRules, err := getStructValidationRules(fieldInstance)
			if err != nil {
				return validationRules, err
			}
			validationRules = mergeStringMaps(validationRules, nestedValidationRules)
			continue
		}
		fieldTag := field.Tag.Get("validate")
		if fieldTag != "" {
			validationRules[fieldName] = fieldTag
		}
	}
	return validationRules, nil
}

func GetRequestsValidationRules() (map[string]map[string]string, error) {

	var requestsValidationRules = map[string]map[string]string{}
	for _, r := range requests {
		validationRules, err := getStructValidationRules(r)
		if err != nil {

			return requestsValidationRules, err
		}
		reqName := strings.ToLower(reflect.TypeOf(r).Name()[0:1]) + reflect.TypeOf(r).Name()[1:]
		requestsValidationRules[reqName] = validationRules
	}

	return requestsValidationRules, nil
}
