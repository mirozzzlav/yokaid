package db

import (
	"database/sql"
	"fmt"
	"rental-app/api/common"
	"strings"
)

func closeRows(rows *sql.Rows) error {
	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}
	return nil
}

func columnNameToObjName(colName string) string {
	if colName == "id" {
		return "ID"
	}
	return common.ToPascalCase(colName)
}

func getTempUsername(fullName string) string {
	return strings.ToLower(strings.ReplaceAll(fullName, " ", "_"))
}

func GenerateUserName(server common.Server, fullName string) (string, error) {
	tempUsername := getTempUsername(fullName)
	q := server.GetQueriesRepo().GetUsersCountQuery(common.QueryPartial{
		Query:  "username LIKE ?",
		Params: []any{tempUsername + "%"},
	})

	userDuplicates, err := server.GetQueryRunner().GetScalar(q)
	if err == common.ErrNoRows {
		return tempUsername, nil
	}
	if err != nil {
		return "", err
	}

	usernameSuffix := ""
	if userDuplicates != 0 {
		usernameSuffix = fmt.Sprintf("@%d", userDuplicates)
	}
	return tempUsername + usernameSuffix, nil
}
