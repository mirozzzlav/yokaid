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

func MergeStoreProcessorsQueries(processors ...common.StoreQueryProcessor) (common.StoreQuery, error) {
	var queries []string
	var params []any
	for _, p := range processors {
		q, err := p.GetQuery()
		if err != nil {
			return common.StoreQuery{}, err
		}
		queries = append(queries, q.Query)
		params = append(params, q.Params...)

	}
	return common.StoreQuery{Query: strings.Join(queries, " "), Params: params}, nil
}
func MergeStoreQueries(storeQueries ...common.StoreQuery) common.StoreQuery {

	var params []any
	var queries []string
	for _, q := range storeQueries {
		queries = append(queries, q.Query)
		params = append(params, q.Params...)

	}
	return common.StoreQuery{Query: strings.Join(queries, " "), Params: params}
}

func columnNameToObjName(colName string) string {
	if colName == "id" {
		return "ID"
	}
	return common.ToPascalCase(colName)
}
