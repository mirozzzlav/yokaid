package db

import (
	"database/sql"
	"rental-app/api/common"
)

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	queryManager DBQueryManager
}

// NewStore creates a new store
func NewStore(db *sql.DB) common.Store {
	return SQLStore{
		queryManager: DBQueryManager{
			db: db,
		},
	}
}

func (store SQLStore) GetUser(q common.StoreQuery, fn func(rowBytes []byte)) error {

	return store.queryManager.SelectRow(
		common.StoreQuery{
			Query:  "select * from users where " + q.Query,
			Params: q.Params,
		},
		fn,
	)
}

func (store SQLStore) ListPolicies(fn func(rowBytes []byte)) error {
	return store.queryManager.SelectRowsAsStringArray(
		common.StoreQuery{
			Query:  `select subject, action, resource from policies`,
			Params: []any{},
		},
		fn,
	)
}

func (store SQLStore) ListProfessionals(q common.StoreQuery, fn func(rowBytes []byte)) error {

	q = common.StoreQuery{
		Query: "SELECT * FROM (" +
			"SELECT u.fullname, p.rating, json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services " +
			"FROM professionals p, users u, professionals_services ps, services s " +
			"WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name " +
			"GROUP BY u.username, u.fullname, p.rating" +
			") AS pros WHERE 1=1 " + q.Query,
		Params: q.Params,
	}

	err := store.queryManager.SelectRows(q, fn)
	return err
}
