package application

import (
	"rental-app/api/application/professionals"
	"rental-app/api/application/system"
	"rental-app/api/application/test"
)

func PackageHandlers() []interface{} {
	return []interface{}{
		system.Handlers,
		professionals.Handlers,
		test.Handlers,
	}
}
