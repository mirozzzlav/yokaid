package db

import (
	"context"
	"database/sql"
	"rental-app/api/common"
)

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	db  *sql.DB
	ctx context.Context
}

// NewStore creates a new store
func NewStore(db *sql.DB, ctx context.Context) common.Store {
	return SQLStore{
		db:  db,
		ctx: ctx,
	}
}

func (store SQLStore) GetAUser(username string) (common.User, error) {
	const query = `select * from users where username = $1`
	row := store.db.QueryRowContext(store.ctx, query, username)

	var user common.User
	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Fullname,
		&user.Email,
		&user.HashedPassword,
		&user.PasswordChangedAt,
		&user.CreatedAt,
		&user.Role,
	)

	return user, err
}

func (store SQLStore) ListPolicies() ([]common.Policy, error) {
	const query = `select * from policies`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	var policies []common.Policy
	for rows.Next() {
		var policy common.Policy
		if err := rows.Scan(&policy.Subject, &policy.Action, &policy.Resource); err != nil {
			return nil, err
		}
		policies = append(policies, policy)
	}
	err = closeRows(rows)
	if err != nil {
		return nil, err
	}
	return policies, nil
}

func (store SQLStore) ListPoliciesAsStringArray() ([][]string, error) {
	const query = `select subject, action, resource from policies`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	var policies [][]string
	for rows.Next() {
		var policy common.Policy
		if err := rows.Scan(&policy.Subject, &policy.Action, &policy.Resource); err != nil {
			return nil, err
		}
		policies = append(policies, []string{policy.Subject, policy.Action, policy.Resource})
	}
	err = closeRows(rows)
	if err != nil {
		return nil, err
	}
	return policies, nil
}

func (store SQLStore) ListProfessionals(reqGetters []common.StoreRequestGetter, fn func(rowBytes []byte)) error {

	req, err := GetProfessionalsRequest(reqGetters)
	if err != nil {
		return err
	}

	rows, err := store.db.QueryContext(store.ctx, req.Query, req.Params...)
	if err != nil {
		return err
	}
	err = store.Select(rows, fn)

	return err

}

func (store SQLStore) CreateRental(rental common.Rental) (common.Rental, error) {
	return common.Rental{}, nil
}
