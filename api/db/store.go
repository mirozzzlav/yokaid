package db

import (
	"context"
	"database/sql"
)

// Store defines all functions to execute db queries and transactions
type Store interface {
	GetAUser(ctx context.Context, username string) (User, error)
	GetAUserById(ctx context.Context, id int32) (User, error)
}

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	db *sql.DB
	*Queries
}

// NewStore creates a new store
func NewStore(db *sql.DB) Store {
	return &SQLStore{
		db:      db,
		Queries: New(db),
	}
}
