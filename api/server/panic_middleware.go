package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"regexp"
	"rental-app/api/common"
	"runtime"
	"strings"
	"time"
)

func createLogFile() (*os.File, error) {
	filename := (time.Now().Format("2006-01-02")) + ".error.log"
	logFile, err := os.OpenFile("logs/"+filename, os.O_APPEND|os.O_WRONLY, 0644)

	if os.IsNotExist(err) {
		logFile, err = os.Create("logs/" + filename)
	}
	if err != nil {
		return logFile, nil
	} else {
		return nil, errors.New(fmt.Sprintf("Failed to create -> %s", filename))
	}

}

func closeLogFile(logFile *os.File) error {
	return logFile.Close()
}

func getPanicsFromStackTrace() string {
	stackTrace := make([]byte, 4096)
	stackSize := runtime.Stack(stackTrace, false)
	regex := regexp.MustCompile(`([[:print:]]+\(.+?\))\s+(/[^:]+:\d+)`)
	matches := regex.FindAllStringSubmatch(string(stackTrace[:stackSize]), -1)

	errors := "No panic information found!"
	if len(matches) >= 2 {
		matches = matches[2:]

		var panicError []string

		for _, pn := range matches {
			panicError = append(panicError, pn[2])
		}

		panicError = append(panicError, "\n")

		errors = strings.Join(panicError, "\n")
	}

	return errors
}

func (s *server) logError(logFile *os.File, ctx *gin.Context, err error) {
	scheme := "http"
	reqPath := scheme + "://" + ctx.Request.Host + ctx.Request.URL.Path
	reqMethod := ctx.Request.Method
	panicErrors := getPanicsFromStackTrace()

	if s.config.Environment == "development" {
		log.Printf("\n\u001B[32m%s\u001B[0m:\u001B[31m\u001B[0m \u001B[41;5;28m\u001B[38;53;30m Panic occurred on URL \u001B[0m  \u001B[31m[%s]\u001B[0m  | Method \u001B[31m[%s]\u001B[0m | Error message\n%s\n%s", time.Now().Format("2006-01-02 15:04:05"), reqPath, reqMethod, err.Error(), panicErrors)
	}

	if logFile == nil {
		return
	}

	fileLogger := log.New(logFile, "", log.LstdFlags)
	fileLogger.Printf("Panic occurred on URL %s | method [%s] | Error message\n%s\n%s\n", reqPath, reqMethod, err.Error(), panicErrors)

}

func panicMiddleware(s *server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			r := recover()
			if r == nil {
				return
			}
			logFile, err := createLogFile()
			if err != nil {
				s.logError(nil, ctx, err)
			}

			if httpError, castingOk := r.(common.HttpError); castingOk {
				s.logError(logFile, ctx, httpError.Error)
				common.SetErrorJSONResponse(ctx, httpError.HttpCode, httpError.OutputError)
			}

			closeLogFile(logFile)

		}()
		ctx.Next()
	}
}
