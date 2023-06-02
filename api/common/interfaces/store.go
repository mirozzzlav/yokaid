package interfaces

import "rental-app/api/common/types"

type Store interface {
	GetAUser(username string) (types.User, error)
	ListPolicies() ([]types.Policy, error)
	ListPoliciesAsStringArray() ([][]string, error)
	ListProfessionals(filter string) ([]types.Professional, error)
}
