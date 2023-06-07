package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"regexp"
	"rental-app/api/common"
	"runtime"
	"strings"
	"time"
)

func (server *Server) getErrors(panicMessage string) string {

	regex := regexp.MustCompile(`([[:print:]]+\(.+?\))\s+(/[^:]+:\d+)`)
	matches := regex.FindAllStringSubmatch(panicMessage, -1)

	var errLogs string

	if len(matches) >= 2 {
		matches = matches[2:]

		var panicError []string

		for _, pn := range matches {
			panicError = append(panicError, pn[2])
		}

		panicError = append(panicError, "\n")

		errLogs = strings.Join(panicError, "\n")
	} else {
		errLogs = "No panic information found!"
	}

	return errLogs
}

func (server *Server) errorLogger(c *gin.Context) {
	defer func() {

		if err := recover(); err != nil {
			errMsg := fmt.Sprintf("%v", err)
			var logFile *os.File

			filename := (time.Now().Format("2006-01-02")) + ".error.log"

			logFile, err := os.OpenFile("logs/"+filename, os.O_APPEND|os.O_WRONLY, 0644)

			if err != nil {
				if os.IsNotExist(err) {
					logFile, err = os.Create("logs/" + filename)
					if err != nil {
						log.Println("Failed to create", filename, ":", err)
						return
					}
				} else {
					log.Println("Failed to open", filename, ":", err)
					return
				}
			}

			defer func(logFile *os.File) {
				err := logFile.Close()
				if err != nil {
					fmt.Println(err)
				}
			}(logFile)

			stackTrace := make([]byte, 4096)
			stackSize := runtime.Stack(stackTrace, false)

			scheme := "http"
			reqPath := scheme + "://" + c.Request.Host + c.Request.URL.Path
			reqMethod := c.Request.Method

			panicErrors := server.getErrors(string(stackTrace[:stackSize]))

			if server.config.Environment == "development" {
				fmt.Printf("\n\u001B[32m%s\u001B[0m:\u001B[31m\u001B[0m \u001B[41;5;28m\u001B[38;53;30m Panic occurred on URL \u001B[0m  \u001B[31m[%s]\u001B[0m  | Method \u001B[31m[%s]\u001B[0m | Error message\n%s\n%s", time.Now().Format("2006-01-02 15:04:05"), reqPath, reqMethod, errMsg, panicErrors)
			}

			logger := log.New(logFile, "", log.LstdFlags)
			logger.Printf("Panic occurred on URL %s | method [%s] | Error message\n%s\n%s\n", reqPath, reqMethod, errMsg, panicErrors)

			err1 := errors.New(errMsg)
			common.SetErrorJSONResponse(c, http.StatusInternalServerError, err1)
		}
	}()

	c.Next()
}
