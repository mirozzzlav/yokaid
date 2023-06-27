package db

import (
	"database/sql"
	"encoding/json"
	"rental-app/api/common"
)

func createDataElementAsArray(colValues []any) []any {
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

func (qr QueryRunner) getRows(q common.Query, fn func(rowBytes []byte), asArrayOfArrays bool) error {
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

	var elemBytes []byte
	for rows.Next() {
		err := rows.Scan(pointers...)
		if err != nil {
			return err
		}

		if asArrayOfArrays {
			elemBytes, err = json.Marshal(createDataElementAsArray(values))
		} else {
			elemBytes, err = json.Marshal(createDataElement(columns, values))
		}

		if err != nil {
			return err
		}
		fn(elemBytes)
	}

	err = closeRows(rows)
	return err
}

func (qr QueryRunner) GetScalar(q common.Query) (int, error) {
	qString, qParams := q.GetQuery()
	var scalar int
	err := qr.db.QueryRow(qString, qParams...).Scan(&scalar)

	if err != nil {
		if err == sql.ErrNoRows {
			return 0, common.ErrNoRows
		}
		return 0, err
	}

	return scalar, nil
}

func (qr QueryRunner) GetRows(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, false)
}

func (qr QueryRunner) GetRowsAsArrayOfArrays(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, true)
}

func (qr QueryRunner) Update(q common.Query) error {
	qString, qParams := q.GetQuery()
	result, err := qr.db.Exec(qString, qParams...)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return common.ErrNoRows
	}

	return nil
}

func (qr QueryRunner) Create(q common.Query, IdColumnName string) (int, error) {
	qString, qParams := q.GetQuery()
	if IdColumnName == "" {

		_, err := qr.db.Exec(qString, qParams...)
		return 0, err
	}
	var createdId int
	err := qr.db.QueryRow(qString+" returning "+IdColumnName, qParams...).Scan(&createdId)
	if err != nil {
		return 0, err
	}
	return createdId, nil
}

func (qr QueryRunner) Delete(q common.Query) error {
	qString, qParams := q.GetQuery()
	res, err := qr.db.Exec(qString, qParams...)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()

	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return common.ErrNoRows
	}
	return nil
}
