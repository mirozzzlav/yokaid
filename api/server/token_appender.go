package server

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"strings"
)

type ResponseCapturer struct {
	gin.ResponseWriter
	Body []byte
}

func (r *ResponseCapturer) Write(b []byte) (int, error) {
	r.Body = b
	return r.ResponseWriter.Write(b)
}

func JSONResponseTokenAppender(server interfaces.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		// Create a ResponseCapturer instance that wraps the original ResponseWriter
		capturer := &ResponseCapturer{ResponseWriter: ctx.Writer}
		// Replace the original ResponseWriter with the ResponseCapturer
		ctx.Writer = capturer

		// Check if the response is JSON and if the response body was captured
		contentType := ctx.Writer.Header().Get("Content-Type")
		if !strings.HasPrefix(contentType, "application/json") || capturer.Body == nil {
			return
		}
		// Parse the captured response body into a map or struct
		var jsonResponse map[string]interface{}
		err := json.Unmarshal(capturer.Body, &jsonResponse)
		if err != nil {
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				helpers.GetJSONResponse(err, nil),
			)
			return
		}

		refreshToken, _ := auth.GetFreshToken(ctx, server)
		// Modify the response data
		jsonResponse["refreshToken"] = refreshToken

		// Convert the modified data back to JSON
		newBody, err := json.Marshal(jsonResponse)
		if err != nil {
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				helpers.GetJSONResponse(err, nil),
			)
			return
		}

		// Set the modified response body
		ctx.Writer.Write(newBody)
		// Execute the remaining middleware chain
		ctx.Next()
	}
}
