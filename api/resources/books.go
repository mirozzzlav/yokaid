package resources

// type listRequest struct {
// 	PageID   int32 `form:"page_id" binding:"required,min=1"`
// 	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
// }

type Book struct {
	Title  string `json:"title"`
	Author string `json:"author"`
}

var MockedBooks = []Book{
	{
		Title:  "Anarchist manifesto",
		Author: "Jozef Kelna",
	},
	{
		Title:  "Breaking the rulez",
		Author: "Milos",
	},
}

//func (server *Server) listBooks(ctx *gin.Context) {
//	var req listRequest
//	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
//	arg := db.ListAccountsParams{
//		Owner:  authPayload.Username,
//		Limit:  req.PageSize,
//		Offset: (req.PageID - 1) * req.PageSize,
//	}
//
//	accounts, err := server.store.ListAccounts(ctx, arg)
//	if err != nil {
//		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
//		return
//	}
//
//	ctx.JSON(http.StatusOK, MockedBooks)
//}
