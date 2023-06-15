package db

import (
	"database/sql"
	"encoding/json"
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

func (store SQLStore) Select(rows *sql.Rows, fn func(rowBytes []byte)) error {
	columns, err := rows.Columns()
	if err != nil {
		return err
	}

	var result []map[string]any
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
		var resultObj = make(map[string]any, len(columns))
		for i, colName := range columns {
			value := values[i]
			valueBytes, isByteArray := value.([]byte)
			//column value can be byte array (for example json encoded into bytes)
			if isByteArray {
				var jsonV json.RawMessage
				_ = json.Unmarshal(valueBytes, &jsonV)
				resultObj[colName] = jsonV
			} else {
				resultObj[colName] = value
			}

		}
		result = append(result, resultObj)
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		return err
	}

	err = closeRows(rows)
	if err != nil {
		return err
	}

	fn(resultBytes)
	return nil
}
