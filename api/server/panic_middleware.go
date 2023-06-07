package server

import (
	"github.com/gin-gonic/gin"
	"log"
	"rental-app/api/common"
)

func panicMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			log.Println("panic middleware defer")
			r := recover()
			if r == nil {
				return
			}

			if err, castingOk := r.(common.HttpError); castingOk {
				log.Printf("Error -> %v", err.Error)
				common.SetErrorJSONResponse(ctx, err.HttpCode, err.OutputError)
			}
		}()
		ctx.Next()
	}
}
