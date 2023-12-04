package db

import (
	"fmt"
	"regexp"
	"strings"
	"yokaid/api/common"
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

func (qr QueriesRepo) GetProfessionalsQuery(filter common.QueryPartial, lang string, limit int) common.Query {

	query := `SELECT 
	  professionals.id, 
	  professionals.full_name,
	  professionals.business_id, 
	  professionals.location, 
	  professionals.location_lat, 
	  professionals.location_lng,
	  professions_view.professions 
	FROM 
	  professionals JOIN (
		  SELECT JSON_AGG(
			JSON_BUILD_OBJECT(
			  'id', professions.id, 'title', title->>?
			)
		  ) AS professions, professional_professions.professional_id 
		  FROM
			professional_professions JOIN professions ON professional_professions.profession_id = professions.id 
		  GROUP BY
			professional_professions.professional_id
	  ) AS professions_view ON professions_view.professional_id = professionals.id`

	params := []any{lang}

	if filter.Query != "" {
		return dbQuery{
			partials: []common.QueryPartial{
				{
					Query:  query + " AND ",
					Params: params,
				},
				filter,
			},
		}
	}

	if limit != -1 {
		query += " LIMIT ?"
		params = append(params, limit)
	}

	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: params,
			},
		},
	}

}
func (qr QueriesRepo) GetProfessionalDetailQuery(professionalId, reviewsPage int, userId string, lang string) common.Query {

	contactObj := "NULL AS contact, "
	var params []any = []any{lang, professionalId, professionalId, professionalId}

	if userId != "" || !common.Config.PayContact {
		contactObj = "JSON_BUILD_OBJECT('email', professionals.email, 'phone', professionals.phone) AS contact, "
	}

	query := fmt.Sprintf(`SELECT 
	  professionals.id, 
	  professionals.full_name,
	  %s
	  professionals.business_id, 
	  professionals.location, 
	  professionals.location_lat, 
	  professionals.location_lng,
	  professions_view.professions,
	  reviews_view.reviews,
      reviews_stats_view.rating, 
      reviews_stats_view.reviews_count
	FROM professionals
	JOIN (
	 SELECT 
		professional_professions.professional_id,
		JSON_AGG(JSON_BUILD_OBJECT('id', professions.id, 'title', title->>?)) AS professions
	 FROM 
		professional_professions JOIN professions ON professional_professions.profession_id = professions.id
	 GROUP BY 
		professional_professions.professional_id
	) AS professions_view ON professions_view.professional_id = professionals.id
	JOIN (
		SELECT 
			professional_id,
			JSON_AGG(
				JSON_BUILD_OBJECT(
				  'id', id, 'text', text, 'rating', rating, 
				  'images', images
				)
			) AS reviews 
		FROM (
			SELECT reviews.id, professional_id, reviews.text, reviews.rating, review_images_view.images
			FROM 
			  reviews
			  JOIN payments ON reviews.id = payments.id
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
			WHERE payments.state='%s' AND professional_id = ?
			ORDER BY reviews.created_at DESC
	    	LIMIT %d 
		) AS reviews_ordered GROUP BY reviews_ordered.professional_id
	) AS reviews_view ON professionals.id = reviews_view.professional_id
	JOIN (
	  SELECT COUNT(reviews.id) AS reviews_count, ROUND(AVG(reviews.rating)) AS rating, reviews.professional_id 
	  FROM reviews JOIN payments ON reviews.id = payments.id
	  WHERE payments.state='%s' AND reviews.professional_id = ?
	  GROUP BY reviews.professional_id
	) AS reviews_stats_view 
	ON professionals.id = reviews_stats_view.professional_id
	WHERE professionals.id =?`,
		contactObj, common.PaymentStates.Paid, common.Config.ReviewsPerPage*reviewsPage, common.PaymentStates.Paid,
	)

	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: params,
			},
		},
	}

}

func (qr QueriesRepo) GetProfessionalsCountQuery(filter common.QueryPartial) common.Query {
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

func (qr QueriesRepo) CreateProfessionalQuery(req common.CreateProfessionalRequest) common.Query {
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

func (qr QueriesRepo) CreateProfessionalProfessionsQuery(professionalId int, professions []int) common.Query {

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

func (qr QueriesRepo) CreateReviewQuery(paymentId string, professionalId int, req common.CreateReviewRequest) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `INSERT INTO reviews (id, professional_id, text, rating) VALUES (?, ?, ?, ?)`,
				Params: []any{
					paymentId,
					professionalId,
					req.Text,
					req.Rating,
				},
			},
		},
	}
}

func (qr QueriesRepo) GetProfessionsQuery(filter common.QueryPartial, lang string) common.Query {
	query := "SELECT id, title->>? AS title FROM professions"

	if filter.Query != "" {
		query += " WHERE "
	}

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{lang},
			},
			filter,
			{
				Query:  " LIMIT 5",
				Params: []any{},
			},
		},
	}
	return q
}

func (qr QueriesRepo) CreatePaymentQuery(id string, userId common.UserId, productId string, paymentState string) common.Query {

	query := `INSERT INTO payments ("id", "user_id", "product_id", "state") VALUES(?, ?, ?, ?)`

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query:  query,
				Params: []any{id, userId, productId, paymentState},
			},
		},
	}
	return q
}

func (qr QueriesRepo) CheckPaymentExist(userId common.UserId, productId string) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: fmt.Sprintf(
					"SELECT id FROM payments WHERE user_id = ? AND product_id = ? AND state = '%s'",
					common.PaymentStates.Paid,
				),
				Params: []any{userId, productId},
			},
		},
	}
}

func (qr QueriesRepo) GetProfessionalContactQuery(professionalId int, userId common.UserId, columns ...string) common.Query {

	columnsStr := "email, phone"
	if len(columns) > 0 {
		columnsStr = strings.Join(columns, ",")
	}

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query: fmt.Sprintf(`SELECT %s FROM professionals JOIN user_professional_contacts 
    					ON professionals.id = user_professional_contacts.professional_id
    					JOIN payments ON user_professional_contacts.id = payments.id 
    					WHERE professionals.id = ? AND payments.user_id = ? 
    					AND payments.product_id='con' AND payments.state='%s'`, columnsStr, common.PaymentStates.Paid),
				Params: []any{professionalId, userId},
			},
		},
	}
	return q
}

func (qr QueriesRepo) GetProfessionalContactQueryByPaymentIdQuery(paymentId string) common.Query {

	q := dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `SELECT email, phone FROM professionals JOIN user_professional_contacts 
    					ON professionals.id = user_professional_contacts.professional_id
    					JOIN payments ON user_professional_contacts.id = payments.id 
    					WHERE payments.id = ? AND payments.product_id='con' AND payments.state=?`,
				Params: []any{paymentId, common.PaymentStates.Paid},
			},
		},
	}
	return q
}

func (qr QueriesRepo) CreateProfessionalContactQuery(paymentId string, req common.CreateUserProfessionalContactRequest) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `INSERT INTO user_professional_contacts (id, professional_id) VALUES (?, ?)`,
				Params: []any{
					paymentId,
					req.ProfessionalId,
				},
			},
		},
	}
}

func (qr QueriesRepo) MakePaymentQuery(code string) common.Query {
	return dbQuery{
		partials: []common.QueryPartial{
			{
				Query: `UPDATE payments SET state= ? WHERE id = ?`,
				Params: []any{
					common.PaymentStates.Paid,
					code,
				},
			},
		},
	}
}
