package db

import (
	"fmt"
	"yokaid/api/common"
)

func (r PostgresProfessionalRepository) Insert() int {
	q := dbQuery{
		partials: []QueryPartial{
			{
				Query:  "INSERT INTO users (username, full_name, email, role) VALUES (?, ?, ?, ?)",
				Params: []any{"username", "Full Name", "test@test.com", "admin"},
			},
		},
	}

	useridAny, err := r.QueryRunner.Exec(q, "id")

	if err != nil {
		fmt.Println(err)
	}

	userId, err := common.ConvertToInt(useridAny)
	common.CheckErrAndPanic(err)
	return userId
}

func (r PostgresProfessionalRepository) Update(id int) {
	q := dbQuery{
		partials: []QueryPartial{
			{
				Query:  "UPDATE users SET full_name = 'New Full Name' WHERE id = ?",
				Params: []any{id},
			},
		},
	}

	_, err := r.QueryRunner.Exec(q)
	common.CheckErrAndPanic(err)
}

func (r PostgresProfessionalRepository) Delete(id int) {

	q := dbQuery{
		partials: []QueryPartial{
			{
				Query:  "DELETE FROM users WHERE id = ?",
				Params: []any{id},
			},
		},
	}

	_, err := r.QueryRunner.Exec(q)
	common.CheckErrAndPanic(err)
}
