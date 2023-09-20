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
	Password        any `json:"password" validate:"required,string,min=1"`
}

type CreatePasswordChangeRequest struct {
	Email any `validate:"required,email"`
}

type PasswordChangeRequest struct {
	Password any `validate:"password"`
}

type CreateRewiewRequest struct {
	Text   *string `json:"text" validate:"omitempty,string"`
	Rating int     `json:"rating" validate:"numeric,required,min=1,max=5"`
}

type CreateProfessionalRequest struct {
	FullName    string  `json:"fullName" validate:"multiWords"`
	Location    string  `json:"location" validate:"string,required"`
	LocationLat float64 `json:"locationLat" validate:"numeric,required"`
	LocationLng float64 `json:"locationLng" validate:"numeric,required"`
	BusinessId  *string `json:"businessId" validate:"omitempty,string"`
	Phone       *string `json:"phone" validate:"required_without=Email,omitempty,phone"`
	Email       *string `json:"email" validate:"required_without=Phone,omitempty,email"`
	// either email or phone has to be filled in
}

type CreateProfessionalWithReviewRequest struct {
	Professional CreateProfessionalRequest `json:"professional"`
	Review       CreateRewiewRequest       `json:"review"`
	Services     []int                     `json:"services" validate:"required"`
}

type CreateReviewForExistingProfessionalRequest struct {
	ProfessionalId int                 `json:"professionalId" validate:"required"`
	Review         CreateRewiewRequest `json:"review"`
}
