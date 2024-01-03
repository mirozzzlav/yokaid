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
		Pattern: "/media/get/{mediaFolderId}/{mediaId}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			params := mux.Vars(r)
			mediaId := params["mediaId"]
			mediaFolderId := params["mediaFolderId"]

			files, _ := filepath.Glob(fmt.Sprintf("%s%s/%s*",
				common.Config.MediaFolder, mediaFolderId, mediaId))
			filesTmp, _ := filepath.Glob(fmt.Sprintf("%stmp/%s_%s*",
				common.Config.MediaFolder, mediaFolderId, mediaId))
			files = append(files, filesTmp...)

			if len(files) == 0 {
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

			files, err := filepath.Glob(fmt.Sprintf("%s,tmp/%s_%s*",
				common.Config.MediaFolder, mediaFolderId, mediaId))
			if err != nil {
				panic(deleteErrResposne)
			}

			for _, filePath := range files {
				err := os.Remove(filePath)
				if err != nil {
					panic(deleteErrResposne)
				}
			}

			mediaFolder := fmt.Sprintf("%s%s", common.Config.MediaFolder, mediaFolderId)
			isEmpty, err := common.IsFolderEmpty(mediaFolder)
			if err != nil {
				panic(deleteErrResposne)
			}
			if isEmpty {
				_ = os.RemoveAll(mediaFolder)
			}
			common.SendOKResponse(w, nil)

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
				path := fmt.Sprintf("%s%d", common.Config.MediaFolder, mediaFolderId)
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

			common.SendOKResponse(w, data)

		},
		Method: "GET",
	},
	{
		Pattern: "/media/upload",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			u := uploadPkg.Upload{
				Writer: w,
				Req:    r,
				Setup: uploadPkg.Setup{
					Path: common.Config.MediaFolder,
					Extensions: []string{
						"gif", "jpg", "png", "webp",
					},
					Name: "image",
					Size: 1024 * 1024 * 20, // 20MBs in bytes
				}}

			u.Run()

		},
		Method: "POST",
	},
	{
		Pattern: "/media/confirm/{mediaFolderId}",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			commonErrResponse := common.HttpResponse{
				Body: common.HttpResponseBody{Msg: "Error while confirming media folder", Data: nil},
				Code: http.StatusInternalServerError,
			}

			params := mux.Vars(r)
			mediaFolderId := params["mediaFolderId"]

			files, err := filepath.Glob(fmt.Sprintf("%stmp/%s_*", common.Config.MediaFolder, mediaFolderId))
			if err != nil || len(files) == 0 {
				panic(common.HttpResponse{
					Body: common.HttpResponseBody{Msg: "No media to confirm", Data: nil},
					Code: http.StatusInternalServerError,
				})
			}

			for _, filePath := range files {
				match := regexp.MustCompile("(?i)([0-9]+)_([0-9]+)\\.([a-z]+)").FindStringSubmatch(filePath)
				if len(match) == 4 {
					err = common.CreateOrUseDirectory(fmt.Sprintf("%s%s", common.Config.MediaFolder, match[1]))
					if err != nil {
						panic(commonErrResponse)
					}
					err = common.RenameFile(
						filePath,
						strings.ToLower(fmt.Sprintf("%s%s/%s.%s",
							common.Config.MediaFolder, match[1], match[2], match[3])),
					)
					if err != nil {
						panic(commonErrResponse)
					}
				}
			}
			common.SendOKResponse(w, nil)

		},
		Method: "GET",
	},
}
