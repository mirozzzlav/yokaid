package common

import (
	"encoding/json"
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
	"time"
	"unicode"
)

func RandomStringWithCharset(length int, charset string) string {
	var charsetRune = []rune(charset)

	b := make([]rune, length)
	for i := range b {
		b[i] = charsetRune[rand.Intn(len(charsetRune))]
	}
	return string(b)
}

func RandomString(length int) string {
	return RandomStringWithCharset(length, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#$.!@")
}

func SetJSONResponse(ctx *gin.Context, response HttpResponse) {
	ctx.AbortWithStatusJSON(response.Code, map[string]any{
		"msg":  response.Msg,
		"data": response.Data,
	})
}

func SetOKJSONResponse(ctx *gin.Context, msg string, data ...any) {
	var respData any = nil

	if len(data) > 0 {
		respData = data[0]
	}
	SetJSONResponse(ctx, HttpResponse{Msg: msg, Code: http.StatusOK, Data: respData})
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

func GetHttpResponseFromError(err error) *HttpResponse {
	validationErrors := GetValidationErrors(err)
	if validationErrors != nil || err == ErrBadInputs {
		return &HttpResponse{
			Code: http.StatusBadRequest,
			Msg:  "Your request is invalid, please review the information you've provided.",
			Data: validationErrors,
		}
	}

	if err == ErrNoRows {
		return &HttpResponse{Code: http.StatusBadRequest, Msg: "No results found for the given request."}
	}

	if err == ErrRecordExist {
		return &HttpResponse{Code: http.StatusBadRequest, Msg: "Given record already exist."}
	}

	return nil
}

func CheckErrAndPanic(err error) {
	if err == nil {
		return
	}

	httpResponse := GetHttpResponseFromError(err)
	if httpResponse != nil {
		panic(*httpResponse)
	}

	panic(err)
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

func ValidatePhoneNumber(number string) bool {
	return regexp.MustCompile(`\+[0-9]{2,3}\s(?:[0-9]{2,4}\s){2}[0-9]{2,4}`).MatchString(number) && len(number) == 16
}

func PhoneNumberValidator(fl validator.FieldLevel) bool {
	return ValidatePhoneNumber(fl.Field().String())
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

func NewRoute(path string, method string, handler gin.HandlerFunc) Route {

	return Route{
		Path:    path,
		Method:  method,
		Handler: handler,
	}
}

func GetJSONBytes(data any) (json.RawMessage, error) {
	var resJson json.RawMessage
	valueBytes, _ := data.([]byte)

	err := json.Unmarshal(valueBytes, &resJson)
	if err != nil {
		return []byte{}, err
	}
	return resJson, nil
}

func GenerateUniqueID() string {
	// Get the current timestamp in nanoseconds
	timestamp := time.Now().UnixNano()

	// Generate a random number to add uniqueness
	rand.Seed(time.Now().UnixNano())
	randomNum := rand.Intn(1000)

	// Combine the timestamp and random number to create a unique ID
	uniqueID := fmt.Sprintf("%d-%d", timestamp, randomNum)

	return uniqueID
}
