package authorization

import (
	"errors"
	"fmt"
	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
	"time"
)

var (
	ErrInvalidToken = errors.New("token is invalid")
	ErrExpiredToken = errors.New("token has expired")
)

type Maker interface {
	CreateToken(username string, tokenDuration time.Duration) (string, error)
	VerifyToken(token string, tokenDuration time.Duration) (*Payload, error)
	GetTokenPayload(token string) (*Payload, error)
}

type PasetoMaker struct {
	paseto       *paseto.V2
	symmetricKey []byte
}

func (maker *PasetoMaker) CreateToken(username string, tokenDuration time.Duration) (string, error) {
	payload, err := NewPayload(username)
	if err != nil {
		return "", err
	}

	return maker.paseto.Encrypt(maker.symmetricKey, payload, nil)
}

func (maker *PasetoMaker) VerifyToken(token string, tokenDuration time.Duration) (*Payload, error) {

	payload, err := maker.GetTokenPayload(token)
	if err != nil {
		return nil, ErrInvalidToken
	}

	err = payload.Valid(tokenDuration)
	if err != nil {
		return nil, err
	}

	return payload, nil
}

func (maker *PasetoMaker) GetTokenPayload(token string) (*Payload, error) {
	payload := &Payload{}
	err := maker.paseto.Decrypt(token, maker.symmetricKey, payload, nil)
	return payload, err
}

func NewPasetoMaker(symmetricKey string) (Maker, error) {
	if len(symmetricKey) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("invalid key size: must be exactly %d characters", chacha20poly1305.KeySize)
	}

	maker := &PasetoMaker{
		paseto:       paseto.NewV2(),
		symmetricKey: []byte(symmetricKey),
	}

	return maker, nil
}
