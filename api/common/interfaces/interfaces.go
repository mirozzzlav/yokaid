package interfaces

import (
	"rental-app/api/common/types"
	"rental-app/api/db"
	"time"
)

type Maker interface {
	CreateToken(username string) (string, error)
	VerifyToken(token string, tokenDuration time.Duration) (*types.AuthPayload, error)
	ParseToken(token string) (*types.AuthPayload, error)
}

type Server interface {
	GetStore() db.Store
	GetTokenMaker() Maker
}
