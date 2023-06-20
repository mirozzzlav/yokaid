package db

import (
	"database/sql"
	"encoding/json"
	"rental-app/api/common"
)

func createDataElement(colNames []string, colValues []any) any {
	resultElem := make(map[string]any, len(colNames))

	for i, colName := range colNames {
		value := colValues[i]
		valueBytes, isByteArray := value.([]byte)
		//column value can be byte array (for example json encoded into bytes)
		if isByteArray {
			var jsonV json.RawMessage
			_ = json.Unmarshal(valueBytes, &jsonV)
			resultElem[columnNameToObjName(colName)] = jsonV
		} else {
			resultElem[columnNameToObjName(colName)] = value
		}
	}
	return resultElem
}

func NewQueryRunner(db *sql.DB) QueryRunner {
	return QueryRunner{
		db: db,
	}
}

type QueryRunner struct {
	db *sql.DB
}

func (qr QueryRunner) GetRows(q common.Query, fn func(rowBytes []byte)) error {
	qString, qParams := q.GetQuery()
	rows, err := qr.db.Query(qString, qParams...)
	if err != nil {
		return err
	}

	columns, err := rows.Columns()
	if err != nil {
		return err
	}

	values := make([]any, len(columns))
	pointers := make([]any, len(columns))
	for i, _ := range values {
		pointers[i] = &values[i]
	}

	for rows.Next() {
		err := rows.Scan(pointers...)
		if err != nil {
			return err
		}

		elemBytes, err := json.Marshal(createDataElement(columns, values))
		if err == nil {
			fn(elemBytes)
		}

	}

	err = closeRows(rows)
	return err
}
