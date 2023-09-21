package common

// this file is consisted of all requests coming from the browser/app to REST API
type RegisterUserRequest struct {
	FullName any `json:"full_name" validate:"multiWords"`
	Email    any `json:"email" validate:"required,email"`
	Role     any `json:"role" validate:"required,publicRoles"`
}

type UpdateUserRequest struct {
	Username any `json:"username" validate:"required,string,min=3"`
	FullName any `json:"full_name" validate:"required,string,min=3"`
	Email    any `json:"email" validate:"required,email"`
}

type LoginUserRequest struct {
	UsernameOrEmail any `json:"username_or_email" validate:"required,string,min=3"`
	Password        any `json:"password" validate:"required,string"`
}

type CreatePasswordChangeRequest struct {
	Email any `validate:"required,email"`
}

type PasswordChangeRequest struct {
	Password any `validate:"password"`
}

type CreateReviewRequest struct {
	Text   *string `json:"text" validate:"omitempty,string"`
	Rating int     `json:"rating" validate:"required,numeric,min=1,max=5"`
}

type CreateProfessionalRequest struct {
	FullName    string  `json:"fullName" validate:"required,multiWords"`
	Location    string  `json:"location" validate:"required,string"`
	LocationLat float64 `json:"locationLat" validate:"required,numeric"`
	LocationLng float64 `json:"locationLng" validate:"required,numeric"`
	BusinessId  *string `json:"businessId" validate:"omitempty,string"`
	Phone       *string `json:"phone" validate:"required_without=Email,omitempty,phone"`
	Email       *string `json:"email" validate:"required_without=Phone,omitempty,email"`
	// either email or phone has to be filled in
}

type CreateProfessionalWithReviewRequest struct {
	Professional CreateProfessionalRequest `json:"professional"`
	Review       CreateReviewRequest       `json:"review"`
	Services     []int                     `json:"services" validate:"required"`
}

type CreateReviewForExistingProfessionalRequest struct {
	ProfessionalId int                 `json:"professionalId" validate:"required"`
	Review         CreateReviewRequest `json:"review"`
}

// add here empty request instances that has validation rules
var requests = []any{
	RegisterUserRequest{},
	UpdateUserRequest{},
	LoginUserRequest{},
	CreatePasswordChangeRequest{},
	PasswordChangeRequest{},
	CreateProfessionalWithReviewRequest{},
	CreateReviewForExistingProfessionalRequest{},
}
