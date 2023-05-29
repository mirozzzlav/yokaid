package store

type IStore interface {
	GetAUser(username string) (User, error)
	ListPolicies() ([]Policy, error)
	ListPoliciesAsStringArray() ([][]string, error)
	ListProfessionals() ([]Professional, error)
}
