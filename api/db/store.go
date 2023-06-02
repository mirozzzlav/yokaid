package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	db  *sql.DB
	ctx context.Context
}

// NewStore creates a new store
func NewStore(db *sql.DB, ctx context.Context) interfaces.Store {
	return SQLStore{
		db:  db,
		ctx: ctx,
	}
}

func (store SQLStore) GetAUser(username string) (types.User, error) {
	const query = `select * from users where username = $1`
	row := store.db.QueryRowContext(store.ctx, query, username)

	var user types.User
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

func (store SQLStore) ListPolicies() ([]types.Policy, error) {
	const query = `select * from policies`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var policies []types.Policy
	for rows.Next() {
		var policy types.Policy
		if err := rows.Scan(&policy.Subject, &policy.Action, &policy.Resource); err != nil {
			return nil, err
		}
		policies = append(policies, policy)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return policies, nil
}

func (store SQLStore) ListPoliciesAsStringArray() ([][]string, error) {
	const query = `select * from policies`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var policies [][]string
	for rows.Next() {
		var policy types.Policy
		if err := rows.Scan(&policy.Subject, &policy.Action, &policy.Resource); err != nil {
			return nil, err
		}
		policies = append(policies, []string{policy.Subject, policy.Action, policy.Resource})
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return policies, nil
}

func (store SQLStore) ListProfessionals(filter string) ([]storePkg.Professional, error) {
	sql := "SELECT * FROM (" +
		"SELECT u.fullname, p.rating, json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services " +
		"FROM professionals p, users u, professionals_services ps, services s " +
		"WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name " +
		"GROUP BY u.username, u.fullname, p.rating" +
		") AS pros"

	rows, err := store.ListData(sql, filter)
	if err != nil {
		return nil, err
	}
	var pros []storePkg.Professional
	for rows.Next() {
		var pro types.Professional
		var servicesStr string

		if err := rows.Scan(&pro.User.Fullname, &pro.Rating, &servicesStr); err != nil {
			log.Printf("ERRRR: %v", err)
			return nil, err
		}
		var services []types.Service
		json.Unmarshal([]byte(servicesStr), &services)
		pro.Services = services
		pros = append(pros, pro)
	}

	err = CloseRows(rows)
	if err != nil {
		return nil, err
	}

	return pros, nil
}
