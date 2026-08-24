package db

import "yokaid/api/common"

type PostgresProfessionalRepository struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

type PostgresContactRepository struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

type PostgresReviewRepository struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

type PostgresPaymentRepository struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

type PostgresProfessionRepository struct {
	QueryRunner QueryRunner
	QueriesRepo QueriesRepo
}

func NewProfessionalRepository(qRunner QueryRunner, qRepo QueriesRepo) common.ProfessionalRepository {
	return &PostgresProfessionalRepository{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}
}

func NewContactRepository(qRunner QueryRunner, qRepo QueriesRepo) common.ContactRepository {
	return &PostgresContactRepository{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}
}

func NewReviewRepository(qRunner QueryRunner, qRepo QueriesRepo) common.ReviewRepository {
	return &PostgresReviewRepository{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}
}

func NewPaymentRepository(qRunner QueryRunner, qRepo QueriesRepo) common.PaymentRepository {
	return &PostgresPaymentRepository{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}
}

func NewProfessionRepository(qRunner QueryRunner, qRepo QueriesRepo) common.ProfessionRepository {
	return &PostgresProfessionRepository{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}
}

func (r *PostgresProfessionalRepository) ProfessionalExists(phone common.PhoneNumber, email *string) (bool, error) {
	filter := QueryPartial{Query: "", Params: []any{}}

	if email != nil {
		filter.Query = "phone = ? OR email = ?"
		filter.Params = []any{phone, *email}
	} else {
		filter.Query = "phone = ?"
		filter.Params = []any{phone}
	}

	prosCountAny, err := r.QueryRunner.GetScalar(r.QueriesRepo.GetProfessionalsCountQuery(filter))

	if err != nil {
		return false, err
	}

	prosCount, _ := common.ConvertToInt(prosCountAny)
	return prosCount > 0, nil

}

func (r *PostgresProfessionalRepository) GetProfessionals(filter string, lang string) ([]common.Professional, error) {
	filterQP, err := handleFilter(filter)
	if err != nil {
		return nil, err
	}
	professionals, rowsLoader := professionalsModelLoader()
	q := r.QueriesRepo.GetProfessionalsQuery(filterQP, lang, -1)
	err = r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	return *professionals, nil
}

func (r *PostgresProfessionalRepository) SearchProfessionals(searchName string, lang string) ([]common.Professional, error) {
	professionals, rowsLoader := professionalsModelLoader()
	q := r.QueriesRepo.GetProfessionalsQuery(
		QueryPartial{
			Query:  "unaccent(full_name) ILIKE unaccent(?)",
			Params: []any{"%" + searchName + "%"},
		}, lang, 5)
	err := r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	return *professionals, nil
}

func (r *PostgresProfessionalRepository) GetProfessionalDetail(professionalId int, reviewsPage int, userId string, lang string) (*common.Professional, error) {
	professionals, rowsLoader := professionalsModelLoader()
	q := r.QueriesRepo.GetProfessionalDetailQuery(
		professionalId,
		reviewsPage,
		userId,
		lang,
	)
	err := r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	if professionals == nil || len(*professionals) == 0 {
		return nil, nil
	}
	return &(*professionals)[0], nil
}

func (r *PostgresProfessionalRepository) CreateProfessional(req common.CreateProfessionalRequest) (int, error) {
	q := r.QueriesRepo.CreateProfessionalQuery(req)
	professionalIdAny, err := r.QueryRunner.Exec(q, "id")
	if err != nil {
		return 0, err
	}
	return common.ConvertToInt(professionalIdAny)
}

func (r *PostgresProfessionalRepository) AddProfessionalProfessions(professionalId int, professionIds []int) error {
	q := r.QueriesRepo.CreateProfessionalProfessionsQuery(professionalId, professionIds)
	_, err := r.QueryRunner.Exec(q, "profession_id")
	return err
}

func (r *PostgresProfessionalRepository) CreateReview(paymentId string, professionalId int, req common.CreateReviewRequest) error {
	q := r.QueriesRepo.CreateReviewQuery(paymentId, professionalId, req)
	_, err := r.QueryRunner.Exec(q)
	return err
}

func (r *PostgresContactRepository) GetProfessionalContactPaymentId(req common.CreateUserProfessionalContactRequest) (string, error) {
	q := r.QueriesRepo.GetProfessionalContactQuery(req.ProfessionalId, req.UserId, "payments.id")
	paymentIdAny, err := r.QueryRunner.GetScalar(q)
	if err != nil {
		return "", err
	}
	return paymentIdAny.(string), nil
}

func (r *PostgresContactRepository) HasUnlockedContact(professionalId int, userId common.UserId) (bool, error) {
	q := r.QueriesRepo.GetProfessionalContactQuery(professionalId, userId, "1")
	_, err := r.QueryRunner.GetScalar(q)
	if err == common.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *PostgresContactRepository) GetUnlockedContactByPaymentId(paymentId string) ([]common.Contact, error) {
	contacts, rowsLoader := contactsModelLoader()
	q := r.QueriesRepo.GetProfessionalContactQueryByPaymentIdQuery(paymentId)
	err := r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	return *contacts, nil
}

func (r *PostgresContactRepository) CreatePayment(id string, userId common.UserId, productId string, paymentState string) (string, error) {
	q := r.QueriesRepo.CreatePaymentQuery(id, userId, productId, paymentState)
	paymentIdAny, err := r.QueryRunner.Exec(q)
	if err != nil {
		return "", err
	}
	return paymentIdAny.(string), nil
}

func (r *PostgresContactRepository) CreateProfessionalContact(paymentId string, req common.CreateUserProfessionalContactRequest) error {
	q := r.QueriesRepo.CreateProfessionalContactQuery(paymentId, req)
	_, err := r.QueryRunner.Exec(q)
	return err
}

func (r *PostgresReviewRepository) UserReviewedProfessional(userId common.UserId, professionalId int) (bool, error) {
	q := r.QueriesRepo.CheckUserReviewedPro(userId, professionalId)
	_, err := r.QueryRunner.GetScalar(q)
	if err == common.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *PostgresReviewRepository) CreateReview(paymentId string, professionalId int, req common.CreateReviewRequest) error {
	q := r.QueriesRepo.CreateReviewQuery(paymentId, professionalId, req)
	_, err := r.QueryRunner.Exec(q)
	return err
}

func (r *PostgresPaymentRepository) CreatePayment(id string, userId common.UserId, productId string, paymentState string) (string, error) {
	q := r.QueriesRepo.CreatePaymentQuery(id, userId, productId, paymentState)
	paymentIdAny, err := r.QueryRunner.Exec(q)
	if err != nil {
		return "", err
	}
	return paymentIdAny.(string), nil
}

func (r *PostgresPaymentRepository) MakePayment(code string) error {
	q := r.QueriesRepo.MakePaymentQuery(code)
	_, err := r.QueryRunner.Exec(q)
	return err
}

func (r *PostgresProfessionRepository) GetProfessions(searchTitle string, lang string) ([]common.Profession, error) {
	professions, rowsLoader := professionsModelLoader()
	q := r.QueriesRepo.GetProfessionsQuery(
		QueryPartial{
			Query:  "unaccent(title->>?) ILIKE unaccent(?)",
			Params: []any{lang, "%" + searchTitle + "%"},
		}, lang)
	err := r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	return *professions, nil
}

func (r *PostgresProfessionRepository) GetAllProfessions(lang string) ([]common.Profession, error) {
	professions, rowsLoader := professionsModelLoader()
	q := r.QueriesRepo.GetProfessionsQuery(QueryPartial{Query: ""}, lang)
	err := r.QueryRunner.GetRows(q, rowsLoader)
	if err != nil {
		return nil, err
	}
	return *professions, nil
}
