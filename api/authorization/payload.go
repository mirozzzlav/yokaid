package authorization

import (
	uuid "github.com/google/uuid"
	"time"
)

type Payload struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	IssuedAt time.Time `json:"issued_at"`
}

func NewPayload(username string) (*Payload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &Payload{
		ID:       tokenID,
		Username: username,
		IssuedAt: time.Now(),
	}
	return payload, nil
}

func (p *Payload) Valid(tokenDuration time.Duration) error {
	if time.Now().After(p.IssuedAt.Add(tokenDuration)) {
		return ErrExpiredToken
	}
	return nil
}
