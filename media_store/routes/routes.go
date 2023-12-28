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
		Pattern: "/media/get/{mediaFolderId}/{mediaId}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			params := mux.Vars(r)
			mediaId := params["mediaId"]
			mediaFolderId := params["mediaFolderId"]

			files, err := filepath.Glob(fmt.Sprintf("media/%s/%s*", mediaFolderId, mediaId))
			if err != nil || len(files) == 0 {
				panic(common.HttpResponse{
					Body: common.HttpResponseBody{Msg: "File not found", Data: nil},
					Code: http.StatusNotFound,
				})
			}

			if _, err := os.Stat(files[0]); err != nil {
				panic(common.HttpResponse{
					Body: common.HttpResponseBody{Msg: "File not found", Data: nil},
					Code: http.StatusNotFound,
				})
			}
			http.ServeFile(w, r, files[0])
		},
		Method: "GET",
	},
	{
		Pattern: "/media/delete/{mediaFolderId}/{mediaId}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			deleteErrResposne := common.HttpResponse{
				Body: common.HttpResponseBody{Msg: "Error while deleting the media", Data: nil},
				Code: http.StatusInternalServerError,
			}

			params := mux.Vars(r)
			mediaId := params["mediaId"]
			mediaFolderId := params["mediaFolderId"]

			files, err := filepath.Glob(fmt.Sprintf("media/%s/%s*", mediaFolderId, mediaId))
			if err != nil {
				panic(deleteErrResposne)
			}

			for _, filePath := range files {
				err := os.Remove(filePath)
				if err != nil {
					panic(deleteErrResposne)
				}
			}

			mediaFolder := fmt.Sprintf("media/%s", mediaFolderId)
			isEmpty, err := common.IsFolderEmpty(mediaFolder)
			if err != nil {
				panic(deleteErrResposne)
			}
			if isEmpty {
				_ = os.RemoveAll(mediaFolder)
			}

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
				path := fmt.Sprintf("media/%d", mediaFolderId)
				if !regexp.MustCompile("[0-9]+").MatchString(mediaFolderIdStr) ||
					!common.CheckPathExist(path) {
					continue
				}

				media, _ := common.ListFiles(path)
				var mediaUrl []string
				for _, m := range media {
					mediaUrl = append(
						mediaUrl,
						fmt.Sprintf("media/get/%s", regexp.MustCompile("[0-9]+/[0-9]+").FindString(m)),
					)
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
