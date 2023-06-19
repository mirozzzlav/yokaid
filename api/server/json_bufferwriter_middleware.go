package server

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"strconv"
)

type bufferWriter struct {
	buffer []byte
	gin.ResponseWriter
	WriteToResponse bool
}

func (w *bufferWriter) Write(b []byte) (int, error) {
	var newJson map[string]any
	var currentResponse map[string]any
	var err error

	if w.buffer != nil {
		err = json.Unmarshal(w.buffer, &newJson)
	}

	if err != nil {
		return 0, err
	}

	if err = json.Unmarshal(b, &currentResponse); err != nil {
		return 0, err
	}

	merged := make(map[string]any)

	for key, value := range currentResponse {
		merged[key] = value
	}

	for key, value := range newJson {
		merged[key] = value
	}
	newBuffer, err := json.Marshal(merged)

	if err != nil {
		return 0, err
	}
	w.buffer = newBuffer
	return 0, nil
}

func (w *bufferWriter) flushBuffer() error {
	var err error
	if w.buffer != nil {
		w.Header().Set("Content-Length", strconv.Itoa(len(w.buffer)))
		_, err = w.ResponseWriter.Write(w.buffer)
	}
	return err
}

func jsonbBufferWriterMiddleware(s *server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		writer := &bufferWriter{ResponseWriter: ctx.Writer}

		ctx.Writer = writer
		defer func() {
			err := writer.flushBuffer()
			if err != nil {
				s.logError(ctx, err)
			}
		}()
		ctx.Next()
	}
}
