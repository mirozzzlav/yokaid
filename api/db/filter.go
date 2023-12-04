package db

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"yokaid/api/common"
)

var filterError = errors.New("wrong filter specified")

func getFilterSpecialSQL(fKey string, fOperator string, fValuePlaceholder string) (string, bool) {

	var filterSQLSpecial = map[string]string{
		"map_bounds":    "location_lat >= ? AND location_lng >= ? AND location_lat <= ? AND location_lng <= ?",
		"profession_id": "EXISTS (SELECT 1 FROM professional_professions ps WHERE ps.professional_id = professionals.id AND ps.profession_id = ?)",
	}

	specialSQL, keyExist := filterSQLSpecial[fKey]
	if keyExist {
		return specialSQL, true
	}

	return "", false
}

// return fKey fOperator, fValuePlaceholder, fParams, error
func getFilterConditionParts(filter string) (string, string, string, []any, error) {
	regex := regexp.MustCompile("([0-9a-zA-Z_\\-.]+) *(>=|<=|>|<|=) *([^ <=>\\[][^\"']*|\\[[^[\\]]*[^,]])")
	filterParts := regex.FindStringSubmatch(filter)

	if len(filterParts) < 4 {
		return "", "", "", nil, filterError
	}

	fKey := common.ToSnakeCase(filterParts[1])
	fOperator := filterParts[2]
	fValue := filterParts[3]

	var params []any
	if fValue[0] == '[' {
		res := ""
		r := regexp.MustCompile(" *, *")
		fValueItems := r.Split(strings.Trim(fValue, "[] "), -1)
		for _, v := range fValueItems {
			if res == "" {
				res = "?"
			} else {
				res = res + ",?"
			}
			params = append(params, interface{}(v))

		}
		return fKey, "IN", "(" + res + ")", params, nil
	}

	if strings.Contains(fValue, "%") {
		fOperator = "LIKE"
	}

	params = []any{fValue}
	return fKey, fOperator, "?", params, nil
}

func handleFilter(filter string) (common.QueryPartial, error) {
	if filter == "" {
		return common.QueryPartial{Query: "", Params: []any{}}, nil
	}
	filters := strings.Split(filter, ";")
	var params []any
	var sqlPartials []string
	sqlPartial := ""
	for _, f := range filters {
		fKey, fOperator, fValuePlaceholder, conditionParams, err := getFilterConditionParts(f)
		if err != nil {
			return common.QueryPartial{}, filterError
		}

		fSpecialSQL, isSpecialFilter := getFilterSpecialSQL(fKey, fOperator, fValuePlaceholder)

		if isSpecialFilter {
			sqlPartial = fSpecialSQL
		} else {
			sqlPartial = fmt.Sprintf("%s %s %s", fKey, fOperator, fValuePlaceholder)
		}

		sqlPartials = append(sqlPartials, sqlPartial)
		params = append(params, conditionParams...)

	}
	return common.QueryPartial{Query: strings.Join(sqlPartials, " AND ") + " ", Params: params}, nil
}
