package db

import (
	"fmt"
	"some-app/api/auth"
	"some-app/api/common"
	"strings"
)

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

func NewStoreHelpers(qRunner common.QueryRunner, qRepo common.QueriesRepo) common.StoreHelpers {

	return &StoreHelpers{
		QueryRunner: qRunner,
		QueriesRepo: qRepo,
	}

}

func (sH *StoreHelpers) GenerateUserName(fullName string) (string, error) {
	tempUsername := getUsernameBase(fullName)
	q := sH.QueriesRepo.GetUsersCountQuery(common.QueryPartial{
		Query:  "username ILIKE ?",
		Params: []any{tempUsername + "%"},
	})

	userDuplicatesAny, err := sH.QueryRunner.GetScalar(q)
	if err == common.ErrNoRows {
		return tempUsername, nil
	}
	if err != nil {
		return "", err
	}

	userDuplicates, err := common.ConvertToInt(userDuplicatesAny)
	if err != nil {
		return "", err
	}
	usernameSuffix := ""
	if userDuplicates != 0 {
		usernameSuffix = fmt.Sprintf("@%d", userDuplicates)
	}
	return tempUsername + usernameSuffix, nil
}

func (_ *StoreHelpers) HandleFilter(filter string) (common.QueryPartial, error) {
	return handleFilter(filter)
}

func (sH *StoreHelpers) ChangeUserPassword(userId int, pass string) error {

	hashedPass, err := auth.HashPassword(pass)
	if err != nil {
		return err
	}

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

	_, err = sH.QueryRunner.Exec(q)
	if err != nil {
		return err
	}

	q = sH.QueriesRepo.DeletePasswordChangeRequestsQuery(
		common.QueryPartial{
			Query:  "user_id = ?",
			Params: []any{userId},
		},
	)

	_, err = sH.QueryRunner.Exec(q, "user_id")
	if err == common.ErrNoRows {
		return nil
	}
	return err
}

func (sH *StoreHelpers) GetUserFromPasswordChangeRequest(token string) (int, error) {
	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "SELECT * FROM password_change_requests WHERE  token = ? and now() - created_at < INTERVAL '24 hours'",
				Params: []any{token},
			},
		},
	}

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
func (sH *StoreHelpers) CreatePasswordChangeRequest(userId int) (string, error) {
	q := sH.QueriesRepo.DeletePasswordChangeRequestsQuery(
		common.QueryPartial{
			Query:  "user_id = ?",
			Params: []any{userId},
		},
	)
	_, err := sH.QueryRunner.Exec(q, "user_id")
	if err != nil && err != common.ErrNoRows {
		return "", err
	}

	q = dbQuery{
		partials: []common.QueryPartial{
			{Query: "INSERT INTO password_change_requests (user_id) VALUES (?)", Params: []any{userId}},
		},
	}

	token, err := sH.QueryRunner.Exec(q, "token")
	if err != nil {
		return "", err
	}

	return token.(string), err
}

func (sH *StoreHelpers) GetUsersCount(emailOrUsername string) (int, error) {
	q := sH.QueriesRepo.GetUsersCountQuery(common.QueryPartial{
		Query:  "email = ? or username = ?",
		Params: []any{emailOrUsername, emailOrUsername},
	})
	usersCountAny, err := sH.QueryRunner.GetScalar(q)
	if err != nil {
		return 0, err
	}
	usersCount, err := common.ConvertToInt(usersCountAny)
	if err != nil {
		return 0, err
	}
	return usersCount, nil
}

func (sH *StoreHelpers) RegisterUser(req common.RegisterUserRequest) (string, error) {
	username, err := sH.GenerateUserName(req.FullName.(string))
	if err != nil {
		return "", err
	}

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "insert into users (username, full_name, email, role) VALUES (?, ?, ?, ?)",
				Params: []any{username, req.FullName, req.Email, req.Role},
			},
		},
	}
	tmpUserId, err := sH.QueryRunner.Exec(q, "id")
	if err != nil {
		return "", err
	}

	userId, err := common.ConvertToInt(tmpUserId)
	if err != nil {
		return "", err
	}
	return sH.CreatePasswordChangeRequest(userId)

}

func (sH *StoreHelpers) GetUser(usernameOrEmail string) (*common.User, error) {

	usersRef, UsersModelLoader := common.UsersModelLoader()
	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "select * from users where (username = ? or email = ?)",
				Params: []any{usernameOrEmail, usernameOrEmail},
			},
		}}

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

func (sH *StoreHelpers) GetUserAndVerifyPassword(usernameOrEmail string, password string) (*common.User, error) {
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

func (sH *StoreHelpers) GetFilterItems(columnAliases []string, searchedItem string, limit int) (*[]common.FilterItem, error) {
	type filterMapItem struct {
		Q       string
		FilterQ string
	}
	var columnAliasesQueries = map[string]filterMapItem{
		"professionId": {
			Q:       "SELECT title AS label, id AS value FROM professions ",
			FilterQ: "WHERE title ILIKE ? ",
		},
	}

	var queries []string
	var params []any

	for _, fId := range columnAliases {
		query, qExists := columnAliasesQueries[fId]
		if qExists {
			if searchedItem != "" {
				queries = append(queries, query.Q+query.FilterQ)
				params = append(params, fmt.Sprintf("%%%s%%", searchedItem))
			} else {
				queries = append(queries, query.Q)
			}
		}

	}
	if len(queries) == 0 {
		return nil, common.ErrNoRows
	}

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  strings.Join(queries, "UNION"),
				Params: params,
			},
			{
				Query:  "LIMIT ?",
				Params: []any{limit},
			},
		},
	}

	filterItems, filterItemsModelLoader := common.FilterItemLoader()

	err := sH.QueryRunner.GetRows(q, filterItemsModelLoader)
	if err != nil {
		return nil, err
	}

	return filterItems, nil
}

func (sH *StoreHelpers) GetProfessionalProfessionsForFilter() (*[]common.FilterItem, error) {

	q := dbQuery{
		partials: []common.QueryPartial{{
			Query:  "SELECT 'professionId' AS filter_column_alias, title AS label, id AS value FROM professions LIMIT 10",
			Params: []any{},
		}},
	}

	filterItems, filterItemsModelLoader := common.FilterItemLoader()

	err := sH.QueryRunner.GetRows(q, filterItemsModelLoader)
	if err != nil {
		return nil, err
	}

	return filterItems, nil
}

func (sH *StoreHelpers) checkProfessionalExist(phone string, email *string) bool {
	filter := common.QueryPartial{Query: "", Params: []any{}}

	if email != nil {
		filter.Query = "phone = ? OR email = ?"
		filter.Params = []any{phone, *email}
	} else {
		filter.Query = "phone = ?"
		filter.Params = []any{phone}
	}

	prosCountAny, err := sH.QueryRunner.GetScalar(sH.QueriesRepo.GetProfessionalsCountQuery(filter))

	if err != nil {
		return false
	}

	prosCount, _ := common.ConvertToInt(prosCountAny)
	return prosCount > 0

}

func (sH *StoreHelpers) CreateReviewAndProfessional(req common.CreateReviewAndProfessionalRequest) (int, error) {
	if sH.checkProfessionalExist(req.Professional.Phone, req.Professional.Email) {
		return 0, common.ErrRecordExist
	}

	q := sH.QueriesRepo.CreateProfessionalQuery(req.Professional)
	professionalIdAny, err := sH.QueryRunner.Exec(q, "id")
	if err != nil {
		return 0, err
	}
	professionalId, err := common.ConvertToInt(professionalIdAny)
	if err != nil {
		return 0, err
	}
	q = sH.QueriesRepo.CreateProfessionalProfessionsQuery(professionalId, req.Professions)
	_, err = sH.QueryRunner.Exec(q, "profession_id")
	if err != nil {
		return 0, err
	}

	q = sH.QueriesRepo.CreateReviewQuery(professionalId, req.Review)

	reviewIdAny, err := sH.QueryRunner.Exec(q)
	if err != nil {
		return 0, err
	}

	reviewId, _ := common.ConvertToInt(reviewIdAny)
	return reviewId, nil

}

func (sH *StoreHelpers) CreatePayment(request common.GetCodeRequest) error {

	q := sH.QueriesRepo.CheckPaymentQuery(request)
	_, err := sH.QueryRunner.GetScalar(q)

	if err == common.ErrNoRows { // payment doesn't exist, create it
		q = sH.QueriesRepo.CreatePaymentQuery(request)
		_, err = sH.QueryRunner.Exec(q, "user_phone")
	}
	return err
}
