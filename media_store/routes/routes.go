package routes

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"yokaid/media_store/common"
	uploadPkg "yokaid/media_store/upload"
)

type Route struct {
	Pattern string
	Handler http.HandlerFunc
	Method  string
}

var Routes = []Route{
	{
		Pattern: "/media/get/{mediaFolderId}/{mediaFile}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			params := mux.Vars(r)
			mediaFile := params["mediaFile"]
			mediaFolderId := params["mediaFolderId"]
			filePath := filepath.Clean(fmt.Sprintf("media/%s/%s", mediaFolderId, mediaFile))
			if _, err := os.Stat(filePath); err != nil {
				panic(common.HttpResponse{
					Body: common.HttpResponseBody{Msg: "File not found", Data: nil},
					Code: http.StatusNotFound,
				})
			}
			http.ServeFile(w, r, filePath)
		},
		Method: "GET",
	},
	{
		Pattern: "/media/list/{mediaFolderIds}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			var mediaFolderIds []int
			json.Unmarshal([]byte(mux.Vars(r)["mediaFolderIds"]), &mediaFolderIds)
			var data = make(map[string][]string)

			for _, mediaFolderId := range mediaFolderIds {
				mediaFolderIdStr := strconv.Itoa(mediaFolderId)
				if !regexp.MustCompile("[0-9]+").MatchString(mediaFolderIdStr) {
					panic(common.HttpResponse{
						Body: common.HttpResponseBody{Msg: "Bad request", Data: nil},
						Code: http.StatusBadRequest,
					})
				}
				path := fmt.Sprintf("media/%d", mediaFolderId)
				if !common.CheckPathExist(path) {
					panic(common.HttpResponse{
						Body: common.HttpResponseBody{Msg: "Requested media not found", Data: nil},
						Code: http.StatusNotFound,
					})
				}
				media, _ := common.ListFiles(path)
				var mediaUrl []string
				for _, m := range media {
					mediaUrl = append(mediaUrl, strings.Replace(m, "media", "media/get", -1))
				}
				data[mediaFolderIdStr] = mediaUrl
			}

			if len(data) == 0 {
				data = nil
			}

			responseBytes, _ := json.Marshal(
				common.HttpResponseBody{Msg: "OK", Data: data},
			)

			fmt.Fprintf(w, string(responseBytes))
		},
		Method: "GET",
	},
	{
		Pattern: "/media/upload",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			u := uploadPkg.Upload{
				Setup: uploadPkg.Setup{
					Writer:     w,
					Request:    r,
					Path:       "media/",
					Extensions: "gif jpg png webp",
					Name:       "image",
					Size:       1024 * 1024 * 32,
				}}

			u.Run()

		},
		Method: "POST",
	},
}
