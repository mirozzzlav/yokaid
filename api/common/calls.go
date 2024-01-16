package common

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

func ConfirmMediaFolder(mediaFolderId string) (HttpResponse, error) {

	url := fmt.Sprintf("http://%s/media/confirm/%s", Config.MediaStoreUrl, mediaFolderId)
	defaultErrResp := HttpResponse{
		Code: http.StatusBadRequest,
		Body: HttpResponseBody{
			Msg: "Error handling media.",
		},
	}

	response, err := http.Get(url)
	defer response.Body.Close()
	if err != nil {
		return defaultErrResp, err
	}

	var respBody HttpResponseBody
	err = json.NewDecoder(response.Body).Decode(&respBody)
	if err != nil {
		return defaultErrResp, err
	}

	if response.StatusCode != http.StatusOK {
		err = errors.New(defaultErrResp.Body.Msg)
	}

	return HttpResponse{
		Code: response.StatusCode,
		Body: respBody,
	}, err

}
