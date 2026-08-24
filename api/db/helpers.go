package db

import (
	"strings"
	"yokaid/api/common"
)

func columnNameToObjName(colName string) string {
	if colName == "id" {
		return "ID"
	}
	return common.ToPascalCase(colName)
}

func getUsernameBase(fullName string) string {
	return strings.ToLower(strings.ReplaceAll(fullName, " ", "_"))
}
