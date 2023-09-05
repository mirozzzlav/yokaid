package auth

import (
	uuid "github.com/google/uuid"
	"some-app/api/common"
	"time"
)

func ValidPayload(p *common.AuthPayload, tokenDuration time.Duration) error {
	if time.Now().After(p.IssuedAt.Add(tokenDuration)) {
		return ErrExpiredToken
	}
	return nil
}

func NewPayload(user common.AuthUser) (*common.AuthPayload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &common.AuthPayload{
		ID:       tokenID,
		User:     user,
		IssuedAt: time.Now(),
	}
	return payload, nil
}
