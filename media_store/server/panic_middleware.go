package server

import (
	"net/http"
	"time"
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
			rec := recover()
			if rec == nil {
				return
			}

			// don't send multiple responses too fast
			time.Sleep(1000 * 100 * time.Microsecond)

			response, code := getErrorResponse(rec)
			common.SendResponse(w, code, response.Msg, response.Data)
		}()

		// Call the next handler in the chain
		next.ServeHTTP(w, r)

	})
}
