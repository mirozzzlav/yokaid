package auth

import (
	"errors"
	"fmt"
	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
	"rental-app/api/common"
	"time"
)

var (
	ErrInvalidToken = errors.New("token is invalid")
	ErrExpiredToken = errors.New("token has expired")
)

type PasetoMaker struct {
	paseto       *paseto.V2
	symmetricKey []byte
}

func (maker *PasetoMaker) CreateToken(user common.AuthUser) (string, error) {
	payload, err := NewPayload(user)
	if err != nil {
		return "", err
	}

	return maker.paseto.Encrypt(maker.symmetricKey, payload, nil)
}

func (maker *PasetoMaker) VerifyToken(token string, tokenDuration time.Duration) (*common.AuthPayload, error) {

	payload, err := maker.ParseToken(token)

	if err != nil {
		return nil, ErrInvalidToken
	}

	err = ValidPayload(payload, tokenDuration)
	if err != nil {
		return nil, err
	}

	return payload, nil
}

func (maker *PasetoMaker) ParseToken(token string) (*common.AuthPayload, error) {
	payload := &common.AuthPayload{}
	err := maker.paseto.Decrypt(token, maker.symmetricKey, payload, nil)
	return payload, err
}

func NewPasetoMaker(symmetricKey string) (common.Maker, error) {
	if len(symmetricKey) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("invalid key size: must be exactly %d characters", chacha20poly1305.KeySize)
	}

	maker := &PasetoMaker{
		paseto:       paseto.NewV2(),
		symmetricKey: []byte(symmetricKey),
	}

	return maker, nil
}
