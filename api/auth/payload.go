package auth

import (
	uuid "github.com/google/uuid"
	"rental-app/api/common/types"
	"time"
)

func ValidPayload(p *types.AuthPayload, tokenDuration time.Duration) error {
	if time.Now().After(p.IssuedAt.Add(tokenDuration)) {
		return ErrExpiredToken
	}
	return nil
}

func NewPayload(user types.AuthUser) (*types.AuthPayload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &types.AuthPayload{
		ID:       tokenID,
		User:     user,
		IssuedAt: time.Now(),
	}
	return payload, nil
}
