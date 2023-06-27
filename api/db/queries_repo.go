package db

import (
	"fmt"
	"regexp"
	"rental-app/api/common"
	"strings"
)

func prepareQueryString(q string) string {
	counter := 0

	re := regexp.MustCompile(`\?`)

	return re.ReplaceAllStringFunc(q, func(match string) string {
		counter++
		return fmt.Sprintf("$%d", counter)
	})
}

type dbQuery struct {
	partials []common.QueryPartial
}

func (q dbQuery) GetQuery() (string, []any) {

	var params []any
	var qStrings []string
	for _, partial := range q.partials {
		qStrings = append(qStrings, partial.Query)
		params = append(params, partial.Params...)
	}

	return prepareQueryString(strings.Join(qStrings, " ")), params
}

type QueriesRepo struct{}

func (qr QueriesRepo) GetUsersQuery(filter common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "select * from users where ",
				Params: []any{},
			},
			filter,
		},
	}
}

func (qr QueriesRepo) GetUsersCountQuery(filter common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  `select count(id) from users where `,
				Params: []any{},
			},
			filter,
		},
	}
}

func (qr QueriesRepo) CreateUserQuery(data common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "insert into users ",
				Params: []any{},
			},
			data,
		},
	}
}

func (qr QueriesRepo) UpdateUsersQuery(data common.QueryPartial, filter common.QueryPartial) common.Query {
	filter.Query = " where " + filter.Query
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "update users set ",
				Params: []any{},
			},
			data,
			filter,
		},
	}
}

func (qr QueriesRepo) ListPoliciesQuery() common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  `select p.user, p.role, p.action, p.resource from policies as p`,
				Params: []any{},
			},
		},
	}

}

func (qr QueriesRepo) QueryUserTest(filter common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  `select * from "users" INNER JOIN "roles" ON "users"."role" = "roles"."name"`,
				Params: []any{},
			},
			filter,
		},
	}
}

func (qr QueriesRepo) ListProfessionalsQuery(filter common.QueryPartial) common.Query {

	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: "SELECT * FROM (" +
					"SELECT u.full_name, p.rating, json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services " +
					"FROM professionals p, users u, professionals_services ps, services s " +
					"WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name " +
					"GROUP BY u.username, u.full_name, p.rating" +
					") AS pros WHERE 1=1 ",
				Params: []any{},
			},
			filter,
		},
	}

}

func (qr QueriesRepo) CreatePasswordChangeRequestQuery(data common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "INSERT INTO password_change_requests",
				Params: []any{},
			},
			data,
		},
	}
}

func (qr QueriesRepo) GetPasswordChangeRequestsQuery(filter common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "SELECT * FROM password_change_requests WHERE ",
				Params: []any{},
			},
			filter,
		},
	}
}

func (qr QueriesRepo) DeletePasswordChangeRequestsQuery(filter common.QueryPartial) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "DELETE FROM password_change_requests WHERE ",
				Params: []any{},
			},
			filter,
		},
	}
}
