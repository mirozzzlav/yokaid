package server

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"rental-app/api/auth"
	"rental-app/api/common/interfaces"
	"strconv"
	"strings"
)

type BufferWriter struct {
	buffer []byte
	gin.ResponseWriter
	WriteToResponse bool
}

func (w *BufferWriter) Write(b []byte) (int, error) {
	w.buffer = b
	return 0, nil
}

func (w *BufferWriter) AppendJSON(jsonToAppend map[string]interface{}) (int, error) {
	if w.buffer == nil || len(w.buffer) == 0 {
		return 0, nil
	}

	var jsonMap map[string]interface{}
	err := json.Unmarshal(w.buffer, &jsonMap)
	if err != nil {
		return 0, err
	}
	for k, val := range jsonToAppend {
		jsonMap[k] = val
	}

	jsonBytes, err := json.Marshal(jsonMap)
	if err != nil {
		return 0, err
	}
	w.Header().Set("Content-Length", strconv.Itoa(len(jsonBytes)))
	return w.ResponseWriter.Write(jsonBytes)

}

func TokenAppenderMiddleware(server interfaces.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Create a ResponseCapturer instance that wraps the original ResponseWriter
		writer := &BufferWriter{ResponseWriter: ctx.Writer}

		// Replace the original ResponseWriter with the ResponseCapturer
		ctx.Writer = writer
		ctx.Next()

		if !strings.HasPrefix(ctx.Writer.Header().Get("Content-Type"), "routes/json") {
			return
		}
		refreshToken, _ := auth.GetFreshToken(ctx, server)

		_, err := writer.AppendJSON(map[string]interface{}{"refreshToken": refreshToken})
		if err != nil {
			return
		}
	}

}
