package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	storePkg "rental-app/api/store"
)

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	db  *sql.DB
	ctx context.Context
}

// NewStore creates a new store
func NewStore(db *sql.DB, ctx context.Context) storePkg.IStore {
	return SQLStore{
		db:  db,
		ctx: ctx,
	}
}

func (store SQLStore) GetAUser(username string) (storePkg.User, error) {
	const query = `select * from users where username = $1`
	row := store.db.QueryRowContext(store.ctx, query, username)

	var user storePkg.User
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

func (store SQLStore) ListPolicies() ([]storePkg.Policy, error) {
	const query = `select * from policies`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var policies []storePkg.Policy
	for rows.Next() {
		var policy storePkg.Policy
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
		var policy storePkg.Policy
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

func (store SQLStore) ListProfessionals() ([]storePkg.Professional, error) {
	const query = `SELECT u.fullname, p.rating, 
			json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services
			FROM professionals p, users u, professionals_services ps, services s 
			WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name
			GROUP BY u.username, u.fullname, p.rating ORDER BY u.fullname`

	rows, err := store.db.QueryContext(store.ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pros []storePkg.Professional

	for rows.Next() {
		var pro storePkg.Professional
		var servicesStr string

		if err := rows.Scan(&pro.User.Fullname, &pro.Rating, &servicesStr); err != nil {
			log.Printf("ERRRR: %v", err)
			return nil, err
		}
		var services []storePkg.Service
		json.Unmarshal([]byte(servicesStr), &services)
		pro.Services = services
		pros = append(pros, pro)

	}
	log.Printf("%v", pros)
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return pros, nil

}
