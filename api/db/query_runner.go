package db

import (
	"database/sql"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/context"
	"some-app/api/common"
)

type queryRunner struct {
	db *sql.DB
	tx *sql.Tx
}

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

func NewQueryRunner(ctx *gin.Context, store any) common.QueryRunner {

	qrAny, qrExist := ctx.Get("queryRunner")
	var qr queryRunner
	if qrExist {
		return qrAny.(*queryRunner)
	}

	db := store.(*sql.DB)

	qr = queryRunner{db: db}
	ctx.Set("queryRunner", &qr)
	return &qr
}

func (qr *queryRunner) Begin() error {
	if qr.tx != nil {
		return nil
	}

	txOptions := &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
		ReadOnly:  false,
	}
	tx, err := qr.db.BeginTx(context.Background(), txOptions)
	if err != nil {
		return err
	}
	qr.tx = tx
	return nil
}

func (qr *queryRunner) Rollback() error {
	if qr.tx == nil {
		return nil
	}
	err := qr.tx.Rollback()
	if err != nil {
		return err
	}
	qr.tx = nil
	return nil
}

func (qr *queryRunner) Commit() error {
	if qr.tx == nil {
		return nil
	}
	err := qr.tx.Commit()
	if err != nil {
		return err
	}
	qr.tx = nil
	return nil
}

func (qr *queryRunner) getRows(q common.Query, fn func(rowBytes []byte), asArrayOfArrays bool) error {

	qString, qParams := q.GetQuery()

	rows, err := qr.tx.Query(qString, qParams...)
	if err != nil {
		return err
	}

	columns, err := rows.Columns()
	if err != nil {
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
			return err
		}

		if asArrayOfArrays {
			elemBytes, err := json.Marshal(createDataElementAsArray(values))
			if err != nil {
				return err
			}
			fn(elemBytes)
		} else {
			elemBytes, err := json.Marshal(createDataElement(columns, values))

			if err != nil {
				return err
			}
			fn(elemBytes)
		}
	}

	if err := rows.Err(); err != nil {
		return err
	}

	return nil
}

func (qr *queryRunner) GetScalar(q common.Query) (int, error) {
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

func (qr *queryRunner) GetRows(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, false)
}

func (qr *queryRunner) GetRowsAsArrayOfArrays(q common.Query, fn func(rowBytes []byte)) error {
	return qr.getRows(q, fn, true)
}

func (qr *queryRunner) Create(q common.Query, IdColumnName string) (any, error) {

	err := qr.Begin()
	if err != nil {
		return 0, err
	}
	var queryRes any

	qString, qParams := q.GetQuery()

	if IdColumnName == "" {
		_, err := qr.tx.Exec(qString, qParams...)
		if err != nil {
			return 0, err
		}
	} else {
		err := qr.tx.QueryRow(qString+" returning "+IdColumnName, qParams...).Scan(&queryRes)

		if err != nil {
			return 0, err
		}
	}

	return queryRes, nil
}

func (qr *queryRunner) Update(q common.Query) error {
	err := qr.Begin()
	if err != nil {
		return err
	}

	qString, qParams := q.GetQuery()

	result, err := qr.tx.Exec(qString, qParams...)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if rowsAffected == 0 {
		return common.ErrNoRows
	}

	return nil
}

func (qr *queryRunner) Delete(q common.Query) error {
	err := qr.Begin()
	if err != nil {
		return err
	}

	qString, qParams := q.GetQuery()

	result, err := qr.tx.Exec(qString, qParams...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if rowsAffected == 0 {
		return common.ErrNoRows
	}

	return nil
}
