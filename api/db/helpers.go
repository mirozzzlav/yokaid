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

func (sH StoreHelpers) GetUsersCount(emailOrUsername string) (int, error) {
	q := sH.QueriesRepo.GetUsersCountQuery(common.QueryPartial{
		Query:  "email = ? or username = ?",
		Params: []any{emailOrUsername, emailOrUsername},
	})
	usersCount, err := sH.QueryRunner.GetScalar(q)
	if err != nil {
		return 0, err
	}
	return usersCount, err
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
	createdId, err := sH.QueryRunner.Create(q, "id")
	if err != nil {
		return "", err
	}

	q = sH.QueriesRepo.CreatePasswordChangeRequestQuery(
		common.QueryPartial{Query: "(user_id) VALUES (?)", Params: []any{createdId}},
	)
	token, err := sH.QueryRunner.Create(q, "token")

	return token.(string), err

}
