package server

import (
	"encoding/json"
	"net/http"
	"yokaid/media_store/common"
)

func getErrorResponse(r any) (common.HttpResponseBody, int) {

	httpResponse, castingOk := r.(common.HttpResponse)
	if castingOk {
		return httpResponse.Body, httpResponse.Code
	}

	return common.HttpResponseBody{
		Msg:  "Hoops, internal server error give it an other try.",
		Data: nil,
	}, http.StatusInternalServerError
}

func PanicMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			r := recover()
			if r == nil {
				return
			}
			w.Header().Set("Content-Type", "application/json")
			response, code := getErrorResponse(r)
			responseBytes, _ := json.Marshal(response)
			http.Error(w, string(responseBytes), code)
		}()

		// Call the next handler in the chain
		next.ServeHTTP(w, r)

	})
}
