package common

// this file is consisted of all requests coming from the browser/app to REST API

type CreatePostRequest struct {
	Latitude  any `validate:"required,numeric"`
	Longitude any `validate:"required,numeric"`
	Text      any `validate:"required,string,min=3"`
}

type RegisterUserRequest struct {
	FullName any `json:"full_name" validate:"required,string,min=3"`
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
