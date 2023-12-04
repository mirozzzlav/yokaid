package common

type CreateReviewRequest struct {
	Text   *string `json:"text" validate:"omitempty,string"`
	Rating int     `json:"rating" validate:"required,numeric,min=1,max=5"`
}

type CreateProfessionalRequest struct {
	FullName    string      `json:"fullName" validate:"required,multiWords"`
	Location    string      `json:"location" validate:"required,string"`
	LocationLat float64     `json:"locationLat" validate:"required,numeric"`
	LocationLng float64     `json:"locationLng" validate:"required,numeric"`
	BusinessId  *string     `json:"businessId" validate:"omitempty,string"`
	Phone       PhoneNumber `json:"phone" validate:"required,phone"`
	Email       *string     `json:"email" validate:"omitempty,email"`
	// either email or phone has to be filled in
}

type UserIdRequest struct {
	UserId UserId `json:"userId" validate:"required,phone"`
}

type CreateReviewAndProfessionalRequest struct {
	Professional CreateProfessionalRequest `json:"professional"`
	Review       CreateReviewRequest       `json:"review"`
	Professions  []int                     `json:"professions" validate:"required"`
	UserIdRequest
}

type CreateReviewForExistingProfessionalRequest struct {
	ProfessionalId int                 `json:"professionalId" validate:"required"`
	Review         CreateReviewRequest `json:"review"`
	UserIdRequest
}

type CreateUserProfessionalContactRequest struct {
	ProfessionalId int `json:"professionalId" validate:"required"`
	UserIdRequest
}

// add here empty request instances that has validation rules
var requests = []any{
	CreateReviewAndProfessionalRequest{},
	CreateReviewForExistingProfessionalRequest{},
}
