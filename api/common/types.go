package common

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"time"
)

type AuthUser struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type AuthPayload struct {
	ID       uuid.UUID `json:"id"`
	User     AuthUser  `json:"user"`
	IssuedAt time.Time `json:"issued_at"`
}

type AuthPolicyConfig struct {
	Model string
}

type Route struct {
	Path      string
	IsPrivate bool
	Method    string
	Handler   gin.HandlerFunc
}

type HttpError struct {
	HttpCode    int
	Error       error
	OutputError error
}

type QueryPartial struct {
	Query  string
	Params []any
}
