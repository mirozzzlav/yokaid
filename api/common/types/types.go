package types

import (
	"github.com/google/uuid"
	"time"
)

type AuthPayload struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	IssuedAt time.Time `json:"issued_at"`
}
