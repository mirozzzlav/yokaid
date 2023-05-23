package types

import (
	"github.com/google/uuid"
	"time"
)

type AuthUser struct {
	Username string `json:"username"`
	Role     string `json:"role`
}

type AuthPayload struct {
	ID       uuid.UUID `json:"id"`
	User     AuthUser  `json:"user"`
	IssuedAt time.Time `json:"issued_at"`
}

type AuthPolicyConfig struct {
	Model string
}

type UserPayload struct {
	UserName string
}
