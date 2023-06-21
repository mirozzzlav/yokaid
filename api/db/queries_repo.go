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

func (qr QueriesRepo) GetUserQuery(filter common.QueryPartial) common.Query {
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

func (qr QueriesRepo) UpdateUserQuery(data common.QueryPartial, filter common.QueryPartial) common.Query {
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
				Query:  `select subject, action, resource from policies`,
				Params: []any{},
			},
		},
	}

}

func (qr QueriesRepo) ListProfessionalsQuery(filter common.QueryPartial) common.Query {

	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: "SELECT * FROM (" +
					"SELECT u.fullname, p.rating, json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services " +
					"FROM professionals p, users u, professionals_services ps, services s " +
					"WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name " +
					"GROUP BY u.username, u.fullname, p.rating" +
					") AS pros WHERE 1=1 ",
				Params: []any{},
			},
			filter,
		},
	}

}

//func UpdateUserQuery(data common.Query, filter common.Query) common.Query {
//	query := "update user set fullname = ?, email = ? WHERE 1=1"
//	Fullname          string
//	Email             string
//	//	q := mergeStoreQueries(filter, data)
//	return MergeQueries()
//	return common.Query{}
//}
