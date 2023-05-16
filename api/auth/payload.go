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

func NewPayload(username string) (*types.AuthPayload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &types.AuthPayload{
		ID:       tokenID,
		Username: username,
		IssuedAt: time.Now(),
	}
	return payload, nil
}
