package db

import (
	"fmt"
	"rental-app/api/common"
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

	userid, err := sH.QueryRunner.Create(q, "id")

	if err != nil {
		fmt.Println(err)
	}

	id := userid.(int64)

	return int(id)
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

	err := sH.QueryRunner.Update(q)
	if err != nil && err != common.ErrNoRows {
		fmt.Println(err)
	}
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

	err := sH.QueryRunner.Delete(q)
	if err != nil && err != common.ErrNoRows {
		fmt.Println(err)
	}
}
