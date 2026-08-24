package app

import "yokaid/api/common"

type AppService struct {
	Store common.Store
}

type ProfessionalService struct {
	Repo        common.ProfessionalRepository
	PaymentRepo common.PaymentRepository
}

type ContactService struct {
	Repo common.ContactRepository
}

type ReviewService struct {
	Repo        common.ReviewRepository
	PaymentRepo common.PaymentRepository
}

type PaymentService struct {
	Repo common.PaymentRepository
}

type ProfessionService struct {
	Repo common.ProfessionRepository
}

func NewAppService(store common.Store) common.AppService {
	return &AppService{
		Store: store,
	}
}

func (s *AppService) Begin() error {
	return s.Store.Begin()
}

func (s *AppService) Commit() error {
	return s.Store.Commit()
}

func (s *AppService) Rollback() error {
	return s.Store.Rollback()
}

func (s *AppService) Professionals() common.ProfessionalService {
	return &ProfessionalService{
		Repo:        s.Store.Professionals(),
		PaymentRepo: s.Store.Payments(),
	}
}

func (s *AppService) Contacts() common.ContactService {
	return &ContactService{
		Repo: s.Store.Contacts(),
	}
}

func (s *AppService) Reviews() common.ReviewService {
	return &ReviewService{
		Repo:        s.Store.Reviews(),
		PaymentRepo: s.Store.Payments(),
	}
}

func (s *AppService) Payments() common.PaymentService {
	return &PaymentService{
		Repo: s.Store.Payments(),
	}
}

func (s *AppService) Professions() common.ProfessionService {
	return &ProfessionService{
		Repo: s.Store.Professions(),
	}
}

func (s *ProfessionalService) GetProfessionals(filter string, lang string) ([]common.Professional, error) {
	return s.Repo.GetProfessionals(filter, lang)
}

func (s *ProfessionalService) SearchProfessionals(searchName string, lang string) ([]common.Professional, error) {
	return s.Repo.SearchProfessionals(searchName, lang)
}

func (s *ProfessionalService) GetProfessionalDetail(professionalId int, reviewsPage int, userId string, lang string) (*common.Professional, error) {
	return s.Repo.GetProfessionalDetail(professionalId, reviewsPage, userId, lang)
}

func (s *ProfessionalService) checkProfessionalExist(phone common.PhoneNumber, email *string) bool {
	exists, err := s.Repo.ProfessionalExists(phone, email)
	if err != nil {
		return false
	}
	return exists
}

func (s *ProfessionalService) CreateReviewAndProfessionalWithPayment(req common.CreateReviewAndProfessionalRequest, paymentState string) (string, int, error) {
	paymentId, err := s.PaymentRepo.CreatePayment(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
	if err != nil {
		return "", 0, err
	}

	professionalId, err := s.createReviewAndProfessional(paymentId, req)
	if err != nil {
		return "", 0, err
	}

	return paymentId, professionalId, nil
}

func (s *ProfessionalService) createReviewAndProfessional(paymentId string, req common.CreateReviewAndProfessionalRequest) (int, error) {
	if s.checkProfessionalExist(req.Professional.Phone, req.Professional.Email) {
		return 0, common.ErrRecordExist
	}

	professionalId, err := s.Repo.CreateProfessional(req.Professional)
	if err != nil {
		return 0, err
	}

	err = s.Repo.AddProfessionalProfessions(professionalId, req.Professions)
	if err != nil {
		return 0, err
	}

	err = s.Repo.CreateReview(paymentId, professionalId, req.Review)
	if err != nil {
		return 0, err
	}

	return professionalId, nil
}

func (s *ContactService) CreateProfessionalContactWithPayment(req common.CreateUserProfessionalContactRequest, paymentState string) (string, error) {
	paymentId, err := s.Repo.GetProfessionalContactPaymentId(req)
	if err != nil && err != common.ErrNoRows {
		return "", err
	}

	if err == common.ErrNoRows {
		paymentId, err = s.Repo.CreatePayment(common.GenerateUniqueID(), req.UserId, "con", paymentState)
		if err != nil {
			return "", err
		}

		err = s.Repo.CreateProfessionalContact(paymentId, req)
		if err != nil {
			return "", err
		}

		return paymentId, nil
	}

	return paymentId, common.ErrRecordExist
}

func (s *ContactService) HasUnlockedContact(professionalId int, userId common.UserId) (bool, error) {
	return s.Repo.HasUnlockedContact(professionalId, userId)
}

func (s *ContactService) GetUnlockedContactByPaymentId(paymentId string) ([]common.Contact, error) {
	return s.Repo.GetUnlockedContactByPaymentId(paymentId)
}

func (s *ReviewService) CreateReviewForExistingProfessionalWithPayment(req common.CreateReviewForExistingProfessionalRequest, paymentState string, checkExistingReview bool) (string, error) {
	if checkExistingReview {
		userReviewed, err := s.Repo.UserReviewedProfessional(req.UserId, req.ProfessionalId)
		if err != nil {
			return "", err
		}
		if userReviewed {
			return "", common.ErrRecordExist
		}
	}

	paymentId, err := s.PaymentRepo.CreatePayment(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
	if err != nil {
		return "", err
	}

	err = s.Repo.CreateReview(paymentId, req.ProfessionalId, req.Review)
	if err != nil {
		return "", err
	}

	return paymentId, nil
}

func (s *PaymentService) MakePayment(code string) error {
	return s.Repo.MakePayment(code)
}

func (s *ProfessionService) GetProfessions(searchTitle string, lang string) ([]common.Profession, error) {
	return s.Repo.GetProfessions(searchTitle, lang)
}

func (s *ProfessionService) GetAllProfessions(lang string) ([]common.Profession, error) {
	return s.Repo.GetAllProfessions(lang)
}
