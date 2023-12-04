package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"regexp"
	"runtime"
	"strings"
	"time"
	"yokaid/api/common"
)

func createLogFile() (*os.File, error) {
	filename := (time.Now().Format("2006-01-02")) + ".error.log"
	logFile, err := os.OpenFile("logs/"+filename, os.O_APPEND|os.O_WRONLY, 0644)

	if os.IsNotExist(err) {
		logFile, err = os.Create("logs/" + filename)
	}
	if err == nil {
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

	panics := "No panic information found!"
	if len(matches) >= 2 {
		matches = matches[2:]

		var panicError []string

		for _, pn := range matches {
			panicError = append(panicError, pn[2])
		}

		panicError = append(panicError, "\n")

		panics = strings.Join(panicError, "\n")
	}

	return panics
}

func (s *server) initRequestLogger() error {
	var logFile *os.File
	var err error
	if common.Config.Logs.LogsToFile {
		logFile, err = createLogFile()
	}
	if err != nil {
		return err
	}

	s.logError = func(ctx *gin.Context, err error) {
		scheme := "http"
		reqPath := scheme + "://" + ctx.Request.Host + ctx.Request.URL.Path
		reqMethod := ctx.Request.Method
		panicErrors := getPanicsFromStackTrace()

		if common.Config.Logs.LogsToScreen {
			log.Printf("\n\u001B[32m%s\u001B[0m:\u001B[31m\u001B[0m \u001B[41;5;28m\u001B[38;53;30m Panic occurred on URL \u001B[0m  \u001B[31m[%s]\u001B[0m  | Method \u001B[0m[%s]\u001B[31m\n%s\n%s", time.Now().Format("2006-01-02 15:04:05"), reqPath, reqMethod, err.Error(), panicErrors)
		}

		fileLogger := log.New(logFile, "", log.LstdFlags)
		fileLogger.Printf("Panic occurred on URL %s | method [%s]\n%s\n%s\n", reqPath, reqMethod, err.Error(), panicErrors)

	}

	return nil
	//if logFile != nil {
	//	errFile = closeLogFile(logFile)
	//}
}
