package authorization

import (
	"github.com/stretchr/testify/require"
	"rental-app/api/utils"
	"testing"
	"time"
)

func TestPasetoMaker(t *testing.T) {
	maker, err := NewPasetoMaker(utils.RandomString(32))
	require.NoError(t, err)

	username := utils.RandomString(12)

	durationConfig := time.Minute
	token, err := maker.CreateToken(username, durationConfig)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	payload, err := maker.VerifyToken(token, durationConfig)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	require.NotZero(t, payload.ID)
	require.Equal(t, username, payload.Username)
	require.WithinDuration(t, time.Now(), payload.IssuedAt, time.Second)
	require.WithinDuration(t, time.Now(), payload.IssuedAt.Add(durationConfig), durationConfig)
}
