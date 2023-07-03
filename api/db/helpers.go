package db

import (
	"database/sql"
	"fmt"
	"rental-app/api/auth"
	"rental-app/api/common"
	"strings"
)

func closeRows(rows *sql.Rows) error {
	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}
	return nil
}

func columnNameToObjName(colName string) string {
	if colName == "id" {
		return "ID"
	}
	return common.ToPascalCase(colName)
}

func getUsernameBase(fullName string) string {
	return strings.ToLower(strings.ReplaceAll(fullName, " ", "_"))
}

type StoreHelpers struct {
	QueryRunner common.QueryRunner
	QueriesRepo common.QueriesRepo
}

func (sH StoreHelpers) GenerateUserName(fullName string) (string, error) {
	tempUsername := getUsernameBase(fullName)
	q := sH.QueriesRepo.GetUsersCountQuery(common.QueryPartial{
		Query:  "username LIKE ?",
		Params: []any{tempUsername + "%"},
	})

	userDuplicates, err := sH.QueryRunner.GetScalar(q)
	if err == common.ErrNoRows {
		return tempUsername, nil
	}
	if err != nil {
		return "", err
	}

	usernameSuffix := ""
	if userDuplicates != 0 {
		usernameSuffix = fmt.Sprintf("@%d", userDuplicates)
	}
	return tempUsername + usernameSuffix, nil
}

func (_ StoreHelpers) HandleFilter(filter string) (common.QueryPartial, error) {
	return handleFilter(filter)
}

func (sH StoreHelpers) ChangeUserPassword(userId int, pass string) error {

	hashedPass, err := auth.HashPassword(pass)
	if err != nil {
		return err
	}

	//TODO transaction
	q := sH.QueriesRepo.UpdateUsersQuery(
		common.QueryPartial{
			Query:  "active = true, hashed_password = ?",
			Params: []any{hashedPass},
		},
		common.QueryPartial{
			Query:  "id = ?",
			Params: []any{userId},
		},
	)

	err = sH.QueryRunner.Update(q)
	if err != nil {
		return err
	}

	q = sH.QueriesRepo.DeletePasswordChangeRequestsQuery(
		common.QueryPartial{
			Query:  "user_id = ?",
			Params: []any{userId},
		},
	)

	err = sH.QueryRunner.Delete(q)
	if err == common.ErrNoRows {
		return nil
	}
	return err
}

func (sH StoreHelpers) GetUserFromPasswordChangeRequest(token string) (int, error) {
	q := sH.QueriesRepo.GetPasswordChangeRequestsQuery(
		common.QueryPartial{
			Query:  "token = ? and now() - created_at < INTERVAL '24 hours'",
			Params: []any{token},
		},
	)

	requestsRef, reqModelLoader := common.PasswordChangeRequestsModelLoader()
	err := sH.QueryRunner.GetRows(q, reqModelLoader)
	if err != nil {
		return 0, err
	}

	if len(*requestsRef) == 0 {
		return 0, common.ErrNoRows
	}

	return (*requestsRef)[0].UserId, nil
}

// CreatePasswordChangeRequest create new pass change query and delete old one if exist
func (sH StoreHelpers) CreatePasswordChangeRequest(userId int) (string, error) {
	q := sH.QueriesRepo.DeletePasswordChangeRequestsQuery(
		common.QueryPartial{
			Query:  "user_id = ?",
			Params: []any{userId},
		},
	)
	err := sH.QueryRunner.Delete(q)
	if err != nil && err != common.ErrNoRows {
		return "", err
	}

	q = sH.QueriesRepo.CreatePasswordChangeRequestQuery(
		common.QueryPartial{Query: "(user_id) VALUES (?)", Params: []any{userId}},
	)

	token, err := sH.QueryRunner.Create(q, "token")
	if err != nil {
		return "", err
	}

	return token.(string), err
}

func (sH StoreHelpers) GetUsersCount(emailOrUsername string) (int, error) {
	q := sH.QueriesRepo.GetUsersCountQuery(common.QueryPartial{
		Query:  "email = ? or username = ?",
		Params: []any{emailOrUsername, emailOrUsername},
	})
	usersCount, err := sH.QueryRunner.GetScalar(q)
	if err != nil {
		return 0, err
	}
	return usersCount, nil
}

func (sH StoreHelpers) RegisterUser(fullName string, email string, role string) (string, error) {
	username, err := sH.GenerateUserName(fullName)
	common.CheckErrAndPanic(err)

	//TODO transaction
	q := sH.QueriesRepo.CreateUserQuery(
		common.QueryPartial{
			Query:  "(username, full_name, email, role) VALUES (?, ?, ?, ?)",
			Params: []any{username, fullName, email, role},
		},
	)
	tmpUserId, err := sH.QueryRunner.Create(q, "id")
	if err != nil {
		return "", err
	}

	userId, err := common.ConvertToInt(tmpUserId)
	if err != nil {
		return "", err
	}
	return sH.CreatePasswordChangeRequest(userId)

}

func (sH StoreHelpers) GetUser(usernameOrEmail string) (*common.User, error) {

	usersRef, UsersModelLoader := common.UsersModelLoader()
	q := sH.QueriesRepo.GetUsersQuery(
		common.QueryPartial{
			Query:  "username = ? or email = ?",
			Params: []any{usernameOrEmail, usernameOrEmail},
		},
	)
	err := sH.QueryRunner.GetRows(q, UsersModelLoader)
	if err != nil {
		return nil, err
	}
	if len(*usersRef) == 0 {
		return nil, common.ErrNoRows
	}
	user := (*usersRef)[0]

	return &user, nil
}

func (sH StoreHelpers) GetUserAndVerifyPassword(usernameOrEmail string, password string) (*common.User, error) {
	user, err := sH.GetUser(usernameOrEmail)
	if err != nil {
		return nil, err
	}

	if user.Active == false {
		return nil, common.ErrNoRows
	}

	err = auth.CheckPassword(password, user.HashedPassword)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (sH StoreHelpers) CreatePost(authorId int, latitude float32, longitude float32, text string) (int, error) {

	q := sH.QueriesRepo.CreatePostQuery(
		common.QueryPartial{
			Query:  "(author, latitude, longitude, text) VALUES (?, ?, ?, ?)",
			Params: []any{authorId, latitude, longitude, text},
		},
	)
	tmpPostID, err := sH.QueryRunner.Create(q, "id")
	if err != nil {
		return 0, err
	}

	postId, err := common.ConvertToInt(tmpPostID)
	if err != nil {
		return 0, err
	}

	return postId, nil
}
