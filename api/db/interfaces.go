package db

type QueryRunner interface {
	GetScalar(q Query) (any, error)
	GetRows(q Query, fn func(rowBytes []byte)) error
	Begin() error
	Commit() error
	Exec(q Query, idColumnNameParam ...string) (any, error)
	Rollback() error
}

type Query interface {
	GetQuery() (string, []any)
}

type QueryPartial struct {
	Query  string
	Params []any
}
