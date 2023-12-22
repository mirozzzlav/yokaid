package upload

import (
	"encoding/json"
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
	Setup Setup
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
	Writer     http.ResponseWriter
	Request    *http.Request
	Path       string
	Name       string
	Extensions string
	Size       int64
	Replace    bool
}

type uploadResponse struct {
	File     string `json:"file"`
	UploadId string `json:"uploadId"`
}

func (u *Upload) SendResponse(uploadId string, file ...string) {
	f := ""
	if len(file) == 1 {
		f = file[0]
	}
	jsonData, _ := json.Marshal(common.HttpResponseBody{
		Msg: "OK",
		Data: uploadResponse{
			UploadId: uploadId,
			File:     f,
		},
	})

	u.Setup.Writer.Header().Set("Content-Type", "application/json")

	_, _ = fmt.Fprintf(u.Setup.Writer, string(jsonData))

}

func (u *Upload) getHeader() (File, error) {
	sliceNumStr := u.Setup.Request.Header.Get("X-Slice")
	sliceNum, err := strconv.Atoi(sliceNumStr)
	if err != nil {
		return File{}, err
	}

	totalSlicesStr := u.Setup.Request.Header.Get("X-Slices")
	totalSlices, err := strconv.Atoi(totalSlicesStr)
	if err != nil {
		return File{}, err
	}

	fileSizeStr := u.Setup.Request.Header.Get("X-File-Size")
	fileSize, err := strconv.ParseInt(fileSizeStr, 10, 64)
	if err != nil {
		return File{}, err
	}

	sliceSizeStr := u.Setup.Request.Header.Get("X-Slice-Size")
	sliceSize, err := strconv.ParseInt(sliceSizeStr, 10, 64)
	if err != nil {
		return File{}, err
	}

	fileName := u.Setup.Request.Header.Get("X-File-Name")

	return File{
		UploadId:         u.Setup.Request.Header.Get("X-Upload-Id"),
		OriginalFileName: fileName,
		SliceNum:         sliceNum,
		TotalSlices:      totalSlices,
		FileSize:         fileSize,
		SliceSize:        sliceSize,
	}, nil
}

func (u *Upload) checkFileSize(filesize int64) error {
	if filesize > u.Setup.Size {
		err := fmt.Errorf("file size exceeds the allowed limit of %d bytes", u.Setup.Size)
		return err
	}
	return nil
}

func (u *Upload) checkFileExtension(ext string) (string, error) {

	extSanitized := ext
	if regexp.MustCompile("(jpe?g)/i").MatchString(ext) {
		extSanitized = "jpg"
	}

	allowedExtensions := strings.Split(
		regexp.MustCompile("(jpe?g)/i").ReplaceAllString(u.Setup.Extensions, "jpg"),
		" ",
	)

	for _, e := range allowedExtensions {
		if e == extSanitized {
			return ext, nil
		}
	}
	err := fmt.Errorf("Invalid file extension.\n Only the following extensions are allowed:\n %s", ext)
	return ext, err
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

	if err = u.Setup.Request.ParseMultipartForm(32 << 20); err != nil {
		panic(common.NewErrorResponse(
			errors.New("problem parse multipart form"), http.StatusBadRequest))
	}

	if u.Setup.Path[len(u.Setup.Path)-1:] != "/" {
		u.Setup.Path = u.Setup.Path + "/"
	}
	err = common.CreateOrUseDirectory(u.Setup.Path)

	if err != nil {
		panic(common.NewErrorResponse(err, http.StatusBadRequest))
	}

	err = common.IsDirectoryWritable(u.Setup.Path)

	if err != nil {
		panic(common.NewErrorResponse(err, http.StatusBadRequest))
	}

	fileInfo, err := u.getHeader()

	if err != nil {
		panic(common.NewErrorResponse(
			errors.New("can't get file data from the header"), http.StatusBadRequest),
		)
	}

	err = u.checkFileSize(fileInfo.FileSize)

	if err != nil {
		panic(common.NewErrorResponse(
			errors.New("file size problem"), http.StatusBadRequest),
		)
	}
	extension := strings.ToLower(common.GetExtension(fileInfo.OriginalFileName))
	u.Setup.Extensions, err = u.checkFileExtension(extension)
	if err != nil {
		panic(common.NewErrorResponse(err, http.StatusBadRequest))
	}

	data, _, err := u.Setup.Request.FormFile("file")
	if err != nil {
		panic(common.NewErrorResponse(errors.New("failed to retrieve a file")))
	}

	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			panic(common.NewErrorResponse(errors.New("failed to retrieve a file")))
		}
	}(data)

	uploadIdParts, err := getUploadIdParts(fileInfo.UploadId)
	if err != nil {
		panic(common.NewErrorResponse(err, http.StatusBadRequest))
	}

	tmpFileFullPath := fmt.Sprintf("%stmp__%s.%s", u.Setup.Path, fileInfo.UploadId, extension)
	tmpFile, err := common.OpenOrCreateFile(tmpFileFullPath)

	defer common.CloseFile(tmpFile)

	err = uploadDataChunksToFile(tmpFile, data, int64(4096))
	if err != nil {
		panic(common.NewErrorResponse(errors.New("failed to upload data chunks to the file")))
	}

	if fileInfo.TotalSlices == fileInfo.SliceNum {
		finalFileFullPath := fmt.Sprintf(
			"%s%s/%s.%s", u.Setup.Path, uploadIdParts[0], uploadIdParts[1], extension)

		err := common.CreateOrUseDirectory(fmt.Sprintf("%s%s", u.Setup.Path, uploadIdParts[0]))
		if err != nil {
			panic(common.NewErrorResponse(err))
		}

		err = common.RenameFile(
			tmpFileFullPath,
			finalFileFullPath,
		)
		if err != nil {
			panic(common.NewErrorResponse(err))
		}
		u.SendResponse(fileInfo.UploadId, finalFileFullPath)
	} else {
		u.SendResponse(fileInfo.UploadId)
	}
}
