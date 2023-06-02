package db

import (
	"database/sql"
)

func (store SQLStore) ListData(sql string, filter string) (*sql.Rows, error) {
	var params []any

	if filter != "" {
		filterSQL, filterParams, err := GetFilterSQL(filter)
		if err != nil {
			return nil, err
		}
		sql = sql + " WHERE " + filterSQL
		params = append(params, filterParams...)
	}
	rows, err := store.db.QueryContext(store.ctx, sql, params...)

	if err != nil {
		return nil, err
	}

	return rows, nil
}

func CloseRows(rows *sql.Rows) error {
	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}
	return nil
}
