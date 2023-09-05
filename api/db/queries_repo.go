package db

import (
	"fmt"
	"regexp"
	"some-app/api/common"
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

func (qr queriesRepo) GetProfessionalsWithReviewsQuery(filter common.QueryPartial) common.Query {

	query := `SELECT 
	  professionals.id, 
	  professionals.full_name, 
	  professionals.phone, 
	  professionals.email, 
	  professionals.rating, 
	  professionals.business_id, 
	  professionals.location, 
	  professionals.location_lat, 
	  professionals.location_lng, 
	  reviews_view.reviews,
	  services_view.services
	FROM 
	  professionals
	  JOIN (
	      SELECT JSON_AGG(
			JSON_BUILD_OBJECT(
			  'id', services.id, 'title', services.title
			)
	  	  ) AS services, professional_services.professional_id 
	      FROM
	        professional_services JOIN services ON professional_services.service_id = services.id 
	      GROUP BY
	        professional_services.professional_id
	  ) AS services_view ON services_view.professional_id = professionals.id 
	  JOIN (
		SELECT 
		  professional_id, 
		  JSON_AGG(
			JSON_BUILD_OBJECT(
			  'id', id, 'text', text, 'rating', rating, 
			  'images', images
			)
		  ) AS reviews 
		FROM 
		  reviews 
		  LEFT JOIN (
			SELECT 
			  review_id, 
			  JSON_AGG(images.path) as images 
			FROM 
			  review_images 
			  JOIN images ON review_images.image_id = images.id 
			GROUP BY 
			  review_images.review_id
		  ) AS review_images_view ON reviews.id = review_images_view.review_id 
		GROUP BY 
		  professional_id
	) AS reviews_view ON professionals.id = reviews_view.professional_id
	WHERE professionals.active = true `

	if filter.Query != "" {
		return dbQuery{
			partials: []common.QueryPartial{
				{
					Query:  query + " AND ",
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
