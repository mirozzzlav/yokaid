package app

import "yokaid/api/common"

type AppService struct {
	Store common.Store
}

type ProfessionalService struct {
	Store common.Store
}

type ContactService struct {
	Store common.Store
}

type ReviewService struct {
	Store common.Store
}

type PaymentService struct {
	Store common.Store
}

type ProfessionService struct {
	Store common.Store
}

func NewAppService(store common.Store) common.AppService {
	return &AppService{
		Store: store,
	}
}

func (s *AppService) Professionals() common.ProfessionalService {
	return &ProfessionalService{
		Store: s.Store,
	}
}

func (s *AppService) Contacts() common.ContactService {
	return &ContactService{
		Store: s.Store,
	}
}

func (s *AppService) Reviews() common.ReviewService {
	return &ReviewService{
		Store: s.Store,
	}
}

func (s *AppService) Payments() common.PaymentService {
	return &PaymentService{
		Store: s.Store,
	}
}

func (s *AppService) Professions() common.ProfessionService {
	return &ProfessionService{
		Store: s.Store,
	}
}

func (s *ProfessionalService) GetProfessionals(filter string, lang string) ([]common.Professional, error) {
	var professionals []common.Professional
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		professionals, err = store.Professionals().GetProfessionals(filter, lang)
		return err
	})
	return professionals, err
}

func (s *ProfessionalService) SearchProfessionals(searchName string, lang string) ([]common.Professional, error) {
	var professionals []common.Professional
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		professionals, err = store.Professionals().SearchProfessionals(searchName, lang)
		return err
	})
	return professionals, err
}

func (s *ProfessionalService) GetProfessionalDetail(professionalId int, reviewsPage int, userId string, lang string) (*common.Professional, error) {
	var professional *common.Professional
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		professional, err = store.Professionals().GetProfessionalDetail(professionalId, reviewsPage, userId, lang)
		return err
	})
	return professional, err
}

func (_ *ProfessionalService) checkProfessionalExist(repo common.ProfessionalRepository, phone common.PhoneNumber, email *string) bool {
	exists, err := repo.ProfessionalExists(phone, email)
	if err != nil {
		return false
	}
	return exists
}

func (s *ProfessionalService) CreateReviewAndProfessionalWithPayment(req common.CreateReviewAndProfessionalRequest, paymentState string) (string, int, error) {
	var paymentId string
	var professionalId int
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		paymentId, err = store.Payments().CreatePayment(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
		if err != nil {
			return err
		}

		professionalId, err = s.createReviewAndProfessional(store.Professionals(), paymentId, req)
		return err
	})

	return paymentId, professionalId, err
}

func (s *ProfessionalService) createReviewAndProfessional(repo common.ProfessionalRepository, paymentId string, req common.CreateReviewAndProfessionalRequest) (int, error) {
	if s.checkProfessionalExist(repo, req.Professional.Phone, req.Professional.Email) {
		return 0, common.ErrRecordExist
	}

	professionalId, err := repo.CreateProfessional(req.Professional)
	if err != nil {
		return 0, err
	}

	err = repo.AddProfessionalProfessions(professionalId, req.Professions)
	if err != nil {
		return 0, err
	}

	err = repo.CreateReview(paymentId, professionalId, req.Review)
	if err != nil {
		return 0, err
	}

	return professionalId, nil
}

func (s *ContactService) CreateProfessionalContactWithPayment(req common.CreateUserProfessionalContactRequest, paymentState string) (string, error) {
	var paymentId string
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		contactRepo := store.Contacts()
		paymentId, err = contactRepo.GetProfessionalContactPaymentId(req)
		if err != nil && err != common.ErrNoRows {
			return err
		}

		if err == common.ErrNoRows {
			paymentId, err = contactRepo.CreatePayment(common.GenerateUniqueID(), req.UserId, "con", paymentState)
			if err != nil {
				return err
			}

			return contactRepo.CreateProfessionalContact(paymentId, req)
		}

		return common.ErrRecordExist
	})
	return paymentId, err
}

func (s *ContactService) HasUnlockedContact(professionalId int, userId common.UserId) (bool, error) {
	var hasContact bool
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		hasContact, err = store.Contacts().HasUnlockedContact(professionalId, userId)
		return err
	})
	return hasContact, err
}

func (s *ContactService) GetUnlockedContactByPaymentId(paymentId string) ([]common.Contact, error) {
	var contacts []common.Contact
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		contacts, err = store.Contacts().GetUnlockedContactByPaymentId(paymentId)
		return err
	})
	return contacts, err
}

func (s *ReviewService) CreateReviewForExistingProfessionalWithPayment(req common.CreateReviewForExistingProfessionalRequest, paymentState string, checkExistingReview bool) (string, error) {
	var paymentId string
	err := s.Store.WithTransaction(func(store common.Store) error {
		reviewRepo := store.Reviews()
		if checkExistingReview {
			userReviewed, err := reviewRepo.UserReviewedProfessional(req.UserId, req.ProfessionalId)
			if err != nil {
				return err
			}
			if userReviewed {
				return common.ErrRecordExist
			}
		}

		var err error
		paymentId, err = store.Payments().CreatePayment(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
		if err != nil {
			return err
		}

		return reviewRepo.CreateReview(paymentId, req.ProfessionalId, req.Review)
	})

	return paymentId, err
}

func (s *PaymentService) MakePayment(code string) error {
	return s.Store.WithTransaction(func(store common.Store) error {
		return store.Payments().MakePayment(code)
	})
}

func (s *ProfessionService) GetProfessions(searchTitle string, lang string) ([]common.Profession, error) {
	var professions []common.Profession
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		professions, err = store.Professions().GetProfessions(searchTitle, lang)
		return err
	})
	return professions, err
}

func (s *ProfessionService) GetAllProfessions(lang string) ([]common.Profession, error) {
	var professions []common.Profession
	err := s.Store.WithTransaction(func(store common.Store) error {
		var err error
		professions, err = store.Professions().GetAllProfessions(lang)
		return err
	})
	return professions, err
}
