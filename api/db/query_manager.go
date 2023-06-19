package db

import (
	"database/sql"
	"encoding/json"
	"rental-app/api/common"
)

func createSelectElementAsStringArray(colValues []any) any {
	resultElem := make([]any, len(colValues))

	for i, _ := range colValues {
		value := colValues[i]
		valueBytes, isByteArray := value.([]byte)
		//column value can be byte array (for example json encoded into bytes)
		if isByteArray {
			var jsonV json.RawMessage
			_ = json.Unmarshal(valueBytes, &jsonV)
			resultElem[i] = jsonV
		} else {
			resultElem[i] = value
		}
	}
	return resultElem

}
func createSelectElement(colNames []string, colValues []any) any {
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
func _select(db *sql.DB, q common.StoreQuery, fn func(rowBytes []byte), selectOneRow bool, resultAsStringArray bool) error {

	rows, err := db.Query(q.Query, q.Params...)
	if err != nil {
		return err
	}

	columns, err := rows.Columns()
	if err != nil {
		return err
	}

	result := make([]any, 0)
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
		if resultAsStringArray {
			result = append(result, createSelectElementAsStringArray(values))
		} else {
			result = append(result, createSelectElement(columns, values))
		}

	}

	resultBytes := make([]byte, 0)

	if len(result) > 0 {
		if selectOneRow {
			resultBytes, err = json.Marshal(result[0])
		} else {
			resultBytes, err = json.Marshal(result)
		}
	}

	if err == nil {
		fn(resultBytes)
	}

	err = closeRows(rows)
	return err
}

type DBQueryManager struct {
	db *sql.DB
}

func (qm DBQueryManager) SelectRows(q common.StoreQuery, fn func(rowBytes []byte)) error {
	return _select(qm.db, q, fn, false, false)
}
func (qm DBQueryManager) SelectRowsAsStringArray(q common.StoreQuery, fn func(rowBytes []byte)) error {
	return _select(qm.db, q, fn, false, true)
}

func (qm DBQueryManager) SelectRow(q common.StoreQuery, fn func(rowBytes []byte)) error {
	return _select(qm.db, q, fn, true, false)
}
