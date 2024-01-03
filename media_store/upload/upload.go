package upload

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"yokaid/media_store/common"
)

type IUpload interface {
	Run()
	SendResponse(uploadId string, file ...string)
}

type Upload struct {
	Setup  Setup
	Writer http.ResponseWriter
	Req    *http.Request
}

type File struct {
	UploadId         string
	RequestedWith    string
	CacheControl     string
	OriginalFileName string
	SliceNum         int
	TotalSlices      int
	FileSize         int64
	SliceSize        int64
}

type Setup struct {
	Path       string
	Name       string
	Extensions []string
	Size       int64 // in bytes
	Replace    bool
}

type uploadResponse struct {
	MediaUrl string `json:"mediaUrl"`
	UploadId string `json:"uploadId"`
}

func (u *Upload) SendResponse(uploadId string, mediaUrl ...string) {
	mUrl := ""
	if len(mediaUrl) == 1 {
		mUrl = mediaUrl[0]
	}

	common.SendOKResponse(u.Writer, uploadResponse{
		UploadId: uploadId,
		MediaUrl: mUrl,
	})

}

func (u *Upload) getHeader() (File, error) {
	sliceNumStr := u.Req.Header.Get("X-Slice")
	sliceNum, err := strconv.Atoi(sliceNumStr)
	if err != nil {
		return File{}, err
	}

	totalSlicesStr := u.Req.Header.Get("X-Slices")
	totalSlices, err := strconv.Atoi(totalSlicesStr)
	if err != nil {
		return File{}, err
	}

	fileSizeStr := u.Req.Header.Get("X-File-Size")
	fileSize, err := strconv.ParseInt(fileSizeStr, 10, 64)
	if err != nil {
		return File{}, err
	}

	sliceSizeStr := u.Req.Header.Get("X-Slice-Size")
	sliceSize, err := strconv.ParseInt(sliceSizeStr, 10, 64)
	if err != nil {
		return File{}, err
	}

	fileName := u.Req.Header.Get("X-File-Name")

	return File{
		UploadId:         u.Req.Header.Get("X-Upload-Id"),
		OriginalFileName: fileName,
		SliceNum:         sliceNum,
		TotalSlices:      totalSlices,
		FileSize:         fileSize,
		SliceSize:        sliceSize,
	}, nil
}

func (u *Upload) isFileSizeOk(filesize int64) bool {
	return filesize <= u.Setup.Size
}

func (u *Upload) isFileExtensionAllowed(ext string) bool {
	for _, currentExt := range u.Setup.Extensions {
		if common.SanitizeExtension(currentExt) == common.SanitizeExtension(ext) {
			return true
		}
	}
	return false
}

func uploadDataChunksToFile(file *os.File, data io.Reader, chunkSize int64) error {
	buffer := make([]byte, chunkSize)
	for {
		n, err := data.Read(buffer)
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
		_, err = file.Write(buffer[:n])
		if err != nil {
			return err
		}
	}
	return nil
}

func getUploadIdParts(uploadId string) ([]string, error) {
	match := regexp.MustCompile("^([0-9]+)_([0-9]+)$").FindStringSubmatch(uploadId)
	if len(match) != 3 {
		return []string{}, errors.New("can't parse user inputs")

	}
	return []string{match[1], match[2]}, nil
}

func (u *Upload) Run() {

	var err error
	defaultErrResponse := common.NewErrorResponse(
		errors.New("unknown error while uploading file, try again later"),
		http.StatusBadRequest,
	)
	if err = u.Req.ParseMultipartForm(32 << 20); err != nil {
		panic(defaultErrResponse)
	}

	if u.Setup.Path[len(u.Setup.Path)-1:] != "/" {
		u.Setup.Path = u.Setup.Path + "/"
	}
	err = common.CreateOrUseDirectory(u.Setup.Path)

	if err != nil {
		panic(defaultErrResponse)
	}

	err = common.IsDirectoryWritable(u.Setup.Path)

	if err != nil {
		panic(defaultErrResponse)
	}

	fileInfo, err := u.getHeader()

	if err != nil {
		panic(defaultErrResponse)
	}

	if !u.isFileSizeOk(fileInfo.FileSize) {
		panic(common.NewErrorResponse(
			errors.New("file size problem MBs"), http.StatusBadRequest,
			map[string][]string{
				"messageParts": {fmt.Sprintf("%d", u.Setup.Size/(1024*1024))},
			},
		))
	}
	extension := common.GetExtension(fileInfo.OriginalFileName)
	if !u.isFileExtensionAllowed(extension) {
		panic(common.NewErrorResponse(
			errors.New("invalid extension"), http.StatusBadRequest, map[string][]string{
				"messageParts": {strings.Join(u.Setup.Extensions, ", ")},
			}))
	}

	data, _, err := u.Req.FormFile("file")
	if err != nil {
		panic(defaultErrResponse)
	}

	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			panic(defaultErrResponse)
		}
	}(data)

	err = common.CreateOrUseDirectory(fmt.Sprintf("%s/tmp", u.Setup.Path))
	if err != nil {
		panic(defaultErrResponse)
	}

	tmpFileFullPath := fmt.Sprintf("%s/tmp/%s.%s", u.Setup.Path, fileInfo.UploadId, extension)
	tmpFile, err := common.OpenOrCreateFile(tmpFileFullPath)

	defer common.CloseFile(tmpFile)

	err = uploadDataChunksToFile(tmpFile, data, int64(4096))
	if err != nil {
		panic(defaultErrResponse)
	}

	if fileInfo.TotalSlices == fileInfo.SliceNum {
		uploadIdParts, err := getUploadIdParts(fileInfo.UploadId)
		if err != nil {
			panic(defaultErrResponse)
		}
		u.SendResponse(fileInfo.UploadId, fmt.Sprintf("%s%s/%s", common.Config.MediaFolder, uploadIdParts[0], uploadIdParts[1]))
	} else {
		u.SendResponse(fileInfo.UploadId)
	}
}
