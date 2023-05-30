package test

import (
	"github.com/gin-gonic/gin"
	"log"
	"rental-app/api/common/interfaces"
)

func MyHandler(server interfaces.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		log.Println("Test Handler")
	}
}
