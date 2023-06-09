package common

import "errors"

var AuthErr = errors.New("user is not authorized to proceed with the given request")
