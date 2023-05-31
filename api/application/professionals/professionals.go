package professionals

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
)

type Professionals struct {
}

func NewProfessionals() *Professionals {
	return &Professionals{}
}

func (p *Professionals) List(ctx *gin.Context, server interfaces.Server) {
	pros, _ := server.GetStore().ListProfessionals()
	helpers.SetOKJSONResponse(ctx, pros)
}
