package common

// this file is consisted of all requests coming from the browser/app to REST API
type RegisterUserRequest struct {
	FullName any `json:"fullName" validate:"required,multiWords"`
	Email    any `json:"email" validate:"required,email"`
	Role     any `json:"role" validate:"required,publicRoles"`
}

type UpdateUserRequest struct {
	Username any `json:"username" validate:"required,string,min=3"`
	FullName any `json:"fullName" validate:"required,string,min=3"`
	Email    any `json:"email" validate:"required,email"`
}

type LoginUserRequest struct {
	UsernameOrEmail any `json:"usernameOrEmail" validate:"required,string,min=3"`
	Password        any `json:"password" validate:"required,string"`
}

type CreatePasswordChangeRequest struct {
	Email any `json:"email" validate:"required,email"`
}

type PasswordChangeRequest struct {
	Password any `json:"password" validate:"required,password"`
}

type CodeVerificationRequest struct {
	VerificationPhone string `json:"verificationPhone"`
	VerificationCode  string `json:"verificationCode"`
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
	Phone       string  `json:"phone" validate:"required,phone"`
	Email       *string `json:"email" validate:"omitempty,email"`
	// either email or phone has to be filled in
}

type CreateProfessionalWithReviewRequest struct {
	Professional      CreateProfessionalRequest `json:"professional"`
	Review            CreateReviewRequest       `json:"review"`
	Professions       []int                     `json:"professions" validate:"required"`
	VerificationPhone string                    `json:"verificationPhone"`
	VerificationCode  string                    `json:"verificationCode"`
}

type CreateReviewForExistingProfessionalRequest struct {
	ProfessionalId    int                 `json:"professionalId" validate:"required"`
	Review            CreateReviewRequest `json:"review"`
	VerificationPhone string              `json:"verificationPhone"`
	VerificationCode  string              `json:"verificationCode"`
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
