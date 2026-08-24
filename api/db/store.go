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

func (s *PostgresStore) Rollback() error {
	return s.QueryRunner.Rollback()
}

func (s *PostgresStore) WithTransaction(fn func(store common.Store) error) error {
	err := s.QueryRunner.Begin()
	if err != nil {
		return err
	}

	err = fn(s)
	if err != nil {
		rollbackErr := s.QueryRunner.Rollback()
		if rollbackErr != nil {
			return rollbackErr
		}
		return err
	}

	return s.QueryRunner.Commit()
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
