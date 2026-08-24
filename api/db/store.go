package db

import "yokaid/api/common"

type PostgresStore struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

func NewStore(qRunner QueryRunner) common.Store {
	return &PostgresStore{
		QueryRunner: qRunner,
		QueriesRepo: QueriesRepo{},
	}
}

func (s *PostgresStore) Begin() error {
	return s.QueryRunner.Begin()
}

func (s *PostgresStore) Commit() error {
	return s.QueryRunner.Commit()
}

func (s *PostgresStore) Rollback() error {
	return s.QueryRunner.Rollback()
}

func (s *PostgresStore) Professionals() common.ProfessionalRepository {
	return NewProfessionalRepository(s.QueryRunner, s.QueriesRepo)
}

func (s *PostgresStore) Contacts() common.ContactRepository {
	return NewContactRepository(s.QueryRunner, s.QueriesRepo)
}

func (s *PostgresStore) Reviews() common.ReviewRepository {
	return NewReviewRepository(s.QueryRunner, s.QueriesRepo)
}

func (s *PostgresStore) Payments() common.PaymentRepository {
	return NewPaymentRepository(s.QueryRunner, s.QueriesRepo)
}

func (s *PostgresStore) Professions() common.ProfessionRepository {
	return NewProfessionRepository(s.QueryRunner, s.QueriesRepo)
}
