package db

import (
	"fmt"
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

func (_ *StoreHelpers) HandleFilter(filter string) (common.QueryPartial, error) {
	return handleFilter(filter)
}

func (sH *StoreHelpers) GetFilterItems(columnAliases []string, searchedItem string, limit int, lang string) (*[]common.FilterItem, error) {
	type filterMapItem struct {
		Q       string
		FilterQ string
	}
	var columnAliasesQueries = map[string]filterMapItem{
		"professionId": {
			Q:       "SELECT title->>? AS label, id AS value FROM professions ",
			FilterQ: "WHERE title->>? ILIKE ?",
		},
	}

	var queries []string
	var params []any

	for _, fId := range columnAliases {
		query, qExists := columnAliasesQueries[fId]
		if qExists {
			if searchedItem != "" {
				queries = append(queries, query.Q+query.FilterQ)
				params = append(params, lang, lang, fmt.Sprintf("%%%s%%", searchedItem))
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

func (sH *StoreHelpers) GetProfessionalProfessionsForFilter(lang string) (*[]common.FilterItem, error) {

	q := dbQuery{
		partials: []common.QueryPartial{{
			Query: `SELECT 'professionId' AS filter_column_alias, title->>? AS label, id AS value 
					 FROM professions LIMIT 10`,
			Params: []any{lang},
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

func (sH *StoreHelpers) CreateReviewAndProfessional(paymentId string, req common.CreateReviewAndProfessionalRequest) (int, error) {
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

	q = sH.QueriesRepo.CreateReviewQuery(paymentId, professionalId, req.Review)

	reviewIdAny, err := sH.QueryRunner.Exec(q)
	if err != nil {
		return 0, err
	}

	reviewId, _ := common.ConvertToInt(reviewIdAny)
	return reviewId, nil

}
