package db

import (
	"context"
	"database/sql"
	"encoding/json"
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
	err = CloseRows(rows)
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
	err = CloseRows(rows)
	if err != nil {
		return nil, err
	}
	return policies, nil
}

func (store SQLStore) ListProfessionalsForResponse(filter string) ([]common.ProfessionalResponse, error) {
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
	var pros []common.ProfessionalResponse
	for rows.Next() {
		var pro common.ProfessionalResponse
		var servicesStr string

		if err := rows.Scan(&pro.Fullname, &pro.Rating, &servicesStr); err != nil {
			return nil, err
		}
		var services []common.ServiceResposne
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

func (store SQLStore) CreateRental(rental common.Rental) (common.Rental, error) {
	return common.Rental{}, nil
}
