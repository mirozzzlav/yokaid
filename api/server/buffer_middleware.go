package server

import (
	"github.com/gin-gonic/gin"
	"strconv"
)

type bufferWriter struct {
	buffer []byte
	gin.ResponseWriter
	WriteToResponse bool
}

func (w *bufferWriter) Write(b []byte) (int, error) {
	w.buffer = b
	return 0, nil
}

func (w *bufferWriter) getBuffer() []byte {
	return w.buffer
}

func (w *bufferWriter) flushBuffer() {
	if w.buffer != nil {
		w.Header().Set("Content-Length", strconv.Itoa(len(w.buffer)))
		w.ResponseWriter.Write(w.buffer)
	}
}

func bufferWriterMiddleware() func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		writer := &bufferWriter{ResponseWriter: ctx.Writer}

		ctx.Writer = writer
		defer func() {
			writer.flushBuffer()
		}()
		ctx.Next()
	}
}
