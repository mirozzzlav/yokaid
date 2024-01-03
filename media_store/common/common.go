package common

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type HttpResponseBody struct {
	Msg  string `json:"msg"`
	Data any    `json:"data"`
}

type HttpResponse struct {
	Code int              `json:"code"`
	Body HttpResponseBody `json:"body"`
}

func NewErrorResponse(err error, codeAndData ...any) HttpResponse {
	code := http.StatusInternalServerError
	var data any = nil

	if len(codeAndData) > 0 {
		code = codeAndData[0].(int)
	}

	if len(codeAndData) > 1 {
		data = codeAndData[1]
	}

	return HttpResponse{
		Code: code,
		Body: HttpResponseBody{
			Msg:  err.Error(),
			Data: data,
		},
	}
}

func SendResponse(w http.ResponseWriter, code int, msg string, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	responseBytes, _ := json.Marshal(
		HttpResponseBody{Msg: msg, Data: data},
	)

	fmt.Fprintf(w, string(responseBytes))
}
func SendOKResponse(w http.ResponseWriter, data any) {
	SendResponse(w, http.StatusOK, "OK", data)
}

func ListFiles(directory string, pattern ...string) ([]string, error) {
	var files []string

	err := filepath.Walk(filepath.Clean(directory), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			if len(pattern) > 0 {
				if regexp.MustCompile(pattern[0]).MatchString(path) {
					files = append(files, path)
				}
			} else {
				files = append(files, path)
			}
		}

		return nil
	})

	if err != nil {
		return []string{}, err
	}

	return files, nil
}

func SanitizeExtension(ext string) string {
	if ext == "" || (ext[1] == '.' && len(ext) == 1) {
		return ""
	}

	extSanitized := strings.ToLower(ext)

	if extSanitized[0] == '.' {
		extSanitized = extSanitized[1:]
	}

	if extSanitized == "jpeg" {
		return "jpg"
	}

	return extSanitized
}

func GetExtension(filename string) string {
	return SanitizeExtension(filepath.Ext(filename))
}

func CreateOrUseDirectory(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		err := os.MkdirAll(path, os.ModePerm)
		if err != nil {
			return fmt.Errorf("failed to create directory:\n %s", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to check directory existence:\n %s", err)
	}

	fileInfo, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("failed to get directory information:\n %s", err)
	}

	if !fileInfo.IsDir() {
		return fmt.Errorf("%s is not a directory", path)
	}

	return nil
}

func IsDirectoryWritable(path string) error {

	fileInfo, err := os.Stat(path)
	if err != nil {
		return err
	}

	if !fileInfo.IsDir() {
		return fmt.Errorf("%s is not direct", path)
	}

	fileMode := fileInfo.Mode()
	if fileMode.Perm()&(1<<uint(7)) == 0 {
		err := os.Chmod(path, 0644)

		if err != nil {
			return fmt.Errorf("failed to set directory %s writable: %s", path, err.Error())
		}
	}

	return nil
}

func OpenOrCreateFile(filePath string) (file *os.File, err error) {
	file, err = os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY, 0644)

	if os.IsNotExist(err) {
		file, err = os.Create(filePath)
	}

	if err != nil {
		log.Printf("failed to create %s: %s", filePath, err)
	}

	return file, err
}

func CloseFile(file *os.File) {
	err := file.Close()
	if err != nil {
		fmt.Println(err)
	}
}

func CheckPathExist(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func RenameFile(filePath string, newFilePath string) error {

	if CheckPathExist(newFilePath) {
		// if file on newFilePath exist returning error
		return errors.New("destination file already exist")
	}

	err := os.Rename(filePath, newFilePath)
	if err != nil {
		return err
	}

	return nil
}

func IsFolderEmpty(folderPath string) (bool, error) {
	files, err := ioutil.ReadDir(folderPath)
	if err != nil {
		return false, err
	}

	// Check if there are no files in the directory
	return len(files) == 0, nil
}
