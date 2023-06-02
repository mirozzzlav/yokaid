package auth

import (
	"github.com/stretchr/testify/require"
	"rental-app/api/common"
	"testing"
	"time"
)

func TestPasetoMaker(t *testing.T) {
	maker, err := NewPasetoMaker(common.RandomString(32))
	require.NoError(t, err)

	authUser := common.AuthUser{
		Username: common.RandomString(12),
		Role:     "admin",
	}

	durationConfig := time.Minute
	token, err := maker.CreateToken(authUser)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	payload, err := maker.VerifyToken(token, durationConfig)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	require.NotZero(t, payload.ID)
	require.Equal(t, authUser.Username, payload.User.Username)
	require.WithinDuration(t, time.Now(), payload.IssuedAt, time.Second)
	require.WithinDuration(t, time.Now(), payload.IssuedAt.Add(durationConfig), durationConfig)
}
