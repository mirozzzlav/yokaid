package interfaces

import (
	"rental-app/api/common"
	"rental-app/api/common/types"
	"time"
)

type Maker interface {
	CreateToken(user types.AuthUser) (string, error)
	VerifyToken(token string, tokenDuration time.Duration) (*types.AuthPayload, error)
	ParseToken(token string) (*types.AuthPayload, error)
}

type Server interface {
	GetStore() Store
	GetTokenMaker() Maker
	GetConfig() common.Config
}
