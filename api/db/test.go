package db

import (
	"fmt"
	"some-app/api/common"
)

func (sH StoreHelpers) Insert() int {
	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "INSERT INTO users (username, full_name, email, role) VALUES (?, ?, ?, ?)",
				Params: []any{"username", "Full Name", "test@test.com", "admin"},
			},
		},
	}

	useridAny, err := sH.QueryRunner.Exec(q, "id")

	if err != nil {
		fmt.Println(err)
	}

	userId, err := common.ConvertToInt(useridAny)
	common.CheckErrAndPanic(err)
	return userId
}

func (sH StoreHelpers) Update(id int) {
	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "UPDATE users SET full_name = 'New Full Name' WHERE id = ?",
				Params: []any{id},
			},
		},
	}

	_, err := sH.QueryRunner.Exec(q)
	common.CheckErrAndPanic(err)
}

func (sH StoreHelpers) Delete(id int) {

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "DELETE FROM users WHERE id = ?",
				Params: []any{id},
			},
		},
	}

	_, err := sH.QueryRunner.Exec(q)
	common.CheckErrAndPanic(err)
}
