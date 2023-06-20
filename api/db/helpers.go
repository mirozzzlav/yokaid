package db

import (
	"database/sql"
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

func GetJoinedPartial(processors ...common.QueryPartialProcessor) (common.QueryPartial, error) {
	var queries []string
	var params []any
	for _, p := range processors {
		q, err := p.GetPartial()
		if err != nil {
			return common.QueryPartial{}, err
		}
		queries = append(queries, q.Query)
		params = append(params, q.Params...)

	}
	return common.QueryPartial{Query: strings.Join(queries, " "), Params: params}, nil
}

func columnNameToObjName(colName string) string {
	if colName == "id" {
		return "ID"
	}
	return common.ToPascalCase(colName)
}
