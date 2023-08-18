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
	//for i, param := range params {
	//	paramStr := param.(string)
	//
	//	if common.IsFloat(paramStr) {
	//		params[i], _ = strconv.ParseFloat(paramStr, 64)
	//		continue
	//	}
	//	if common.IsNumeric(paramStr) {
	//		params[i], _ = common.ConvertToInt(paramStr)
	//	}
	//}

	return prepareQueryString(strings.Join(qStrings, " ")), params
}

type queriesRepo struct{}

func (qr queriesRepo) GetUsersCountQuery(filter common.QueryPartial) common.Query {
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

func (qr queriesRepo) UpdateUsersQuery(data common.QueryPartial, filter common.QueryPartial) common.Query {
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

func (qr queriesRepo) ListPoliciesQuery() common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  `select p.user, p.role, p.action, p.resource from policies as p`,
				Params: []any{},
			},
		},
	}

}

func (qr queriesRepo) QueryUserTest(filter common.QueryPartial) common.Query {
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

func (qr queriesRepo) ListPostsQuery(filter common.QueryPartial) common.Query {

	query :=

		"SELECT * FROM (" +
			"SELECT posts.id as id, users.full_name as author, posts.latitude, posts.longitude, posts.text, " +
			"posts.created_at, posts.headline , rental_posts_sql.rent_date_from, rental_posts_sql.rent_date_to, " +
			"rental_posts_sql.price, rental_posts_sql.item_name, rental_posts_sql.item_description, " +
			"rental_posts_sql.item_spec, rental_posts_sql.category, rental_posts_sql.category_id, " +
			"json_agg(images_sql.image_path) as image_paths " +
			"FROM posts JOIN users ON posts.author = users.id " +
			"LEFT JOIN " +
			"(SELECT rental_posts.post_id, rental_posts.rent_date_from, rental_posts.rent_date_to, " +
			"rental_posts.price, items.name as item_name, items.description as item_description, items.spec as item_spec, " +
			"item_categories.name as category, item_categories.id as category_id " +
			"FROM rental_posts JOIN items ON rental_posts.item_id = items.id JOIN " +
			"item_categories ON items.category_id = item_categories.id" +
			") AS rental_posts_sql ON rental_posts_sql.post_id = posts.id  " +
			"LEFT JOIN " +
			"(SELECT post_images.post_id, images.path as image_path " +
			"FROM post_images JOIN images ON post_images.image_id = images.id" +
			") AS images_sql ON images_sql.post_id = posts.id " +
			"GROUP BY posts.id, users.full_name, posts.latitude, posts.longitude, " +
			"posts.text, posts.created_at, posts.headline, rental_posts_sql.rent_date_from, " +
			"rental_posts_sql.rent_date_to, rental_posts_sql.price, rental_posts_sql.item_name, " +
			"rental_posts_sql.item_description, rental_posts_sql.item_spec, " +
			"rental_posts_sql.category, rental_posts_sql.category_id" +
			") AS inner_q"

	if filter.Query != "" {
		return dbQuery{
			partials: []common.QueryPartial{
				{
					Query:  query + " WHERE ",
					Params: []any{},
				},
				filter,
			},
		}
	}
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{},
			},
		},
	}

}

func (qr queriesRepo) DeletePasswordChangeRequestsQuery(filter common.QueryPartial) common.Query {
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

var QueriesRepo = queriesRepo{}
