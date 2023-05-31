package test

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
)

type Test struct {
}

func NewTest() *Test {
	return &Test{}
}
func (test *Test) MyTestHandler1(ctx *gin.Context, _ interfaces.Server) {
	helpers.SetOKJSONResponse(ctx, "Test Handler 1")
}

func (test *Test) MyTestHandler2(ctx *gin.Context, _ interfaces.Server) {
	helpers.SetOKJSONResponse(ctx, "Test Handler 2")
}

func (test *Test) MyTestHandler3(ctx *gin.Context, _ interfaces.Server) {
	helpers.SetOKJSONResponse(ctx, "Test Handler 3")
}
