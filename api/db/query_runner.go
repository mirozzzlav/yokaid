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

func createDataElement(colNames []string, colValues []any) map[string]any {
	resultElem := make(map[string]any)

	for i, colName := range colNames {
		value := colValues[i]
		valueBytes, err := common.GetJSONBytes(value)
		if err == nil {
			resultElem[columnNameToObjName(colName)] = valueBytes
		} else {
			valueBytes, isByteArray := value.([]byte)
			if isByteArray {
				resultElem[columnNameToObjName(colName)] = string(valueBytes)
			} else {
				resultElem[columnNameToObjName(colName)] = value
			}
		}
	}
	return resultElem
}

func createDataElementAsArray(colValues []any) []any {
	resultElem := make([]any, len(colValues))

	for i := range colValues {
		value := colValues[i]
		valueBytes, err := common.GetJSONBytes(value)
		if err == nil {
			resultElem[i] = valueBytes
		} else {
			valueBytes, isByteArray := value.([]byte)
			if isByteArray {
				resultElem[i] = string(valueBytes)
			} else {
				resultElem[i] = value
			}
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

	values := make([]any, len(columns))
	pointers := make([]any, len(columns))
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

func (qr *queryRunner) GetScalar(q common.Query) (any, error) {
	qString, qParams := q.GetQuery()
	var scalar any
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

func (qr *queryRunner) Exec(q common.Query, idColumnNameParam ...string) (any, error) {
	qString, qParams := q.GetQuery()

	idColumnName := "id"
	if len(idColumnNameParam) > 0 {
		idColumnName = idColumnNameParam[0]
	}

	var queryRes any
	err := qr.tx.QueryRow(qString+" returning "+idColumnName, qParams...).Scan(&queryRes)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.ErrNoRows
		}
		return nil, err
	}

	return queryRes, nil
}
