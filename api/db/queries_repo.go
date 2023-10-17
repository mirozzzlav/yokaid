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

func (qr queriesRepo) GetProfessionalsQuery(filter common.QueryPartial, reviews bool, contact bool) common.Query {

	reviewsColumns := `,reviews_view.reviews, reviews_view.rating, reviews_count_view.reviews_count `

	reviewsQuery := fmt.Sprintf(`JOIN (
		SELECT 
		  professional_id, 
		  round(avg(rating)) AS rating,
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
			  JSON_AGG(images.path) AS images 
			FROM 
			  review_images 
			  JOIN images ON review_images.image_id = images.id 
			GROUP BY 
			  review_images.review_id
		  ) AS review_images_view ON reviews.id = review_images_view.review_id 
		WHERE reviews.state='%s'
		GROUP BY 
		  professional_id
	) AS reviews_view ON professionals.id = reviews_view.professional_id
	JOIN (
	  SELECT count(reviews.id) AS reviews_count, reviews.professional_id 
	  FROM reviews 
	  WHERE reviews.state='%s'
	  GROUP BY reviews.professional_id
	) AS reviews_count_view
	ON professionals.id = reviews_count_view.professional_id`, common.ReviewStates.Active, common.ReviewStates.Active)

	if !reviews {
		reviewsQuery = fmt.Sprintf(
			`JOIN (
			  SELECT reviews.professional_id 
			  FROM reviews 
			  WHERE reviews.state='%s'
			  GROUP BY reviews.professional_id
			) AS reviews_count_view
			ON professionals.id = reviews_count_view.professional_id`,
			common.ReviewStates.Active,
		)
		reviewsColumns = ""
	}
	contactColumns := ""
	if contact {
		contactColumns = "professionals.phone, professionals.email, "
	}

	query := fmt.Sprintf(`SELECT 
	  professionals.id, 
	  professionals.full_name,
	  %s
	  professionals.business_id, 
	  professionals.location, 
	  professionals.location_lat, 
	  professionals.location_lng, 
	  professions_view.professions 
	  %s
	FROM 
	  professionals
	  JOIN (
	      SELECT JSON_AGG(
			JSON_BUILD_OBJECT(
			  'id', professions.id, 'title', professions.title
			)
	  	  ) AS professions, professional_professions.professional_id 
	      FROM
	        professional_professions JOIN professions ON professional_professions.profession_id = professions.id 
	      GROUP BY
	        professional_professions.professional_id
	  ) AS professions_view ON professions_view.professional_id = professionals.id %s  `,
		contactColumns, reviewsColumns, reviewsQuery,
	)

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
func (qr queriesRepo) GetProfessionalsCountQuery(filter common.QueryPartial) common.Query {
	q := "SELECT count(id) FROM professionals WHERE "
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  q + filter.Query,
				Params: filter.Params,
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

func (qr queriesRepo) CreateProfessionalQuery(req common.CreateProfessionalRequest) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `INSERT INTO 
    						professionals (full_name, phone, email, business_id, location, 
    						               location_lat, location_lng) 
						VALUES (?, ?, ?, ?, ?, ?, ?)`,
				Params: []any{
					req.FullName,
					req.Phone,
					req.Email,
					req.BusinessId,
					req.Location,
					req.LocationLat,
					req.LocationLng,
				},
			},
		},
	}
}

func (qr queriesRepo) CreateProfessionalProfessionsQuery(professionalId int, professions []int) common.Query {

	var valPlaceholders []string
	var params []any
	for _, s := range professions {
		valPlaceholders = append(valPlaceholders, "(?, ?)")
		params = append(params, professionalId, s)
	}

	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: "INSERT INTO professional_professions (professional_id, profession_id) VALUES" +
					strings.Join(valPlaceholders, ","),
				Params: params,
			},
		},
	}
}

func (qr queriesRepo) CreateReviewQuery(professionalId int, req common.CreateReviewRequest) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `INSERT INTO reviews (professional_id, text, rating) VALUES (?, ?, ?)`,
				Params: []any{
					professionalId,
					req.Text,
					req.Rating,
				},
			},
		},
	}
}

func (qr queriesRepo) GetProfessionsQuery(filter common.QueryPartial) common.Query {
	query := `SELECT 
				id, title 
			  FROM
				professions 
			  WHERE `

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{},
			},
			filter,
		},
	}
	return q
}

func (qr queriesRepo) CreatePaymentQuery(userPhone string, paymentType string, entityId int) common.Query {
	query := `INSERT INTO payments ("user_phone", "payment_type", "entity_id") VALUES (?, ?, ?)`

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{userPhone, paymentType, entityId},
			},
		},
	}
	return q
}

func (qr queriesRepo) CheckPaymentQuery(userPhone string, paymentType string, entityId int) common.Query {
	query := `SELECT 1 FROM payments WHERE user_phone = ? AND  payment_type = ? AND entity_id = ?`

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{userPhone, paymentType, entityId},
			},
		},
	}
	return q

}

func (qr queriesRepo) CheckUserProfessionalContactQuery(professionalId int, userPhone string) common.Query {

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  "SELECT 1 FROM user_professional_contacts WHERE professional_id = ? AND user_phone = ?",
				Params: []any{professionalId, userPhone},
			},
		},
	}
	return q

}

var QueriesRepo = queriesRepo{}
