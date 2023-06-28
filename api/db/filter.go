package db

import (
	"errors"
	"fmt"
	"regexp"
	"rental-app/api/common"
	"strings"
)

var filterError = errors.New("wrong filter specified")

func getFilterSpecialSQL(fKey string, fOperator string, fValuePlaceholder string) (string, bool) {

	var filterSQLSpecial = map[string]string{
		"author": fmt.Sprintf("users.full_name %s %s", fOperator, fValuePlaceholder),
	}

	fKey = strings.ToLower(fKey)
	for k, special := range filterSQLSpecial {
		if fKey == k {
			//fKey = strings.ToLower(fKey)
			//fKey = strings.Replace(fKey, special+".", "", -1)
			return special, true
		}
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

	fKey := filterParts[1]
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
	sql := ""
	var params []any
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

		sql = sql + " AND " + sqlPartial
		params = append(params, conditionParams...)

	}
	return common.QueryPartial{Query: sql, Params: params}, nil
}
