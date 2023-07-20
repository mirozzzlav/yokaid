package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"rental-app/api/common"
)

func createDataElementAsArray(colValues []any) []any {
	resultElem := make([]any, len(colValues))

	for i := range colValues {
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

func NewQueryRunner() *QueryRunner {
	db, err := sql.Open(common.Config.DBDriver, common.Config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	return &QueryRunner{
		db: db,
	}
}

type QueryRunner struct {
	db  *sql.DB
	ctx context.Context
	tx  *sql.Tx
}

func (qr *QueryRunner) Begin() {
	if qr.ctx != nil {
		qr.Commit()
	}

	qr.ctx = context.Background()

	txOptions := &sql.TxOptions{
		Isolation: sql.LevelDefault,
		ReadOnly:  false,
	}

	var err error
	qr.tx, err = qr.db.BeginTx(qr.ctx, txOptions)

	if err != nil {
		qr.ctx = nil
		common.CheckErrAndPanic(err)
	}
}

func (qr *QueryRunner) Rollback() {
	if qr.tx != nil {
		if err := qr.tx.Rollback(); err != nil {
			log.Printf("Rollback error: %v\n", err)
		}
		qr.ctx = nil
		qr.tx = nil
	}
}

func (qr *QueryRunner) Commit() {

	defer func() {
		qr.ctx = nil
		qr.tx = nil
	}()

	if err := qr.tx.Commit(); err != nil {
		common.CheckErrAndPanic(err)
	}
}

func (qr *QueryRunner) getRows(q common.Query, fn func(rowBytes []byte), asArrayOfArrays bool) error {

	if qr.ctx == nil {
		qr.Begin()
	}

	qString, qParams := q.GetQuery()

	rows, err := qr.tx.QueryContext(qr.ctx, qString, qParams...)
	if err != nil {
		qr.Rollback()
		return err
	}

	columns, err := rows.Columns()
	if err != nil {
		qr.Rollback()
		return err
	}

	values := make([]interface{}, len(columns))
	pointers := make([]interface{}, len(columns))
	for i := range values {
		pointers[i] = &values[i]
	}

	for rows.Next() {
		err := rows.Scan(pointers...)
		if err != nil {
			qr.Rollback()
			return err
		}

		if asArrayOfArrays {
			elemBytes, err := json.Marshal(createDataElementAsArray(values))
			if err != nil {
				qr.Rollback()
				return err
			}
			fn(elemBytes)
		} else {
			elemBytes, err := json.Marshal(createDataElement(columns, values))

			if err != nil {
				qr.Rollback()
				return err
			}
			fn(elemBytes)
		}
	}

	if err := rows.Err(); err != nil {
		qr.Rollback()
		return err
	}

	return nil
}

func (qr *QueryRunner) GetScalar(q common.Query) (int, error) {
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

func (qr *QueryRunner) GetRows(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, false)
}

func (qr *QueryRunner) GetRowsAsArrayOfArrays(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, true)
}

func (qr *QueryRunner) Create(q common.Query, IdColumnName string) (any, error) {

	if qr.ctx == nil {
		qr.Begin()
	}

	var queryRes any

	qString, qParams := q.GetQuery()

	if IdColumnName == "" {
		_, err := qr.tx.ExecContext(qr.ctx, qString, qParams...)
		if err != nil {
			qr.Rollback()
			return 0, err
		}
	} else {
		err := qr.tx.QueryRowContext(qr.ctx, qString+" returning "+IdColumnName, qParams...).Scan(&queryRes)

		if err != nil {
			qr.Rollback()
			return 0, err
		}
	}

	return queryRes, nil
}

func (qr *QueryRunner) Update(q common.Query) error {
	if qr.ctx == nil {
		qr.Begin()
	}

	qString, qParams := q.GetQuery()

	result, err := qr.tx.ExecContext(qr.ctx, qString, qParams...)

	if err != nil {
		qr.Rollback()
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if rowsAffected == 0 {
		return common.ErrNoRows
	}

	return nil
}

func (qr *QueryRunner) Delete(q common.Query) error {
	if qr.ctx == nil {
		qr.Begin()
	}

	qString, qParams := q.GetQuery()

	result, err := qr.tx.ExecContext(qr.ctx, qString, qParams...)
	if err != nil {
		qr.Rollback()
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if rowsAffected == 0 {
		return common.ErrNoRows
	}

	return nil
}
