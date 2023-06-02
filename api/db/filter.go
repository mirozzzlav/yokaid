package db

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

var filterError = errors.New("wrong filter specified")

func getFilterSpecialSQL(fKey string, fOperator string, fValuePlaceholder string) (string, bool) {
	var filterSQLSpecial = map[string]string{
		"services": "EXISTS (select 1 FROM json_array_elements(services) AS service_json WHERE service_json ->>'%s' %s %s)",
	}

	for special, _ := range filterSQLSpecial {
		if strings.HasPrefix(fKey, special) {
			fKey = strings.Replace(fKey, special+".", "", -1)
			return fmt.Sprintf(filterSQLSpecial[special], fKey, fOperator, fValuePlaceholder), true
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
		for index, v := range fValueItems {

			if res == "" {
				res = "$1"
			} else {
				res = res + ",$" + fmt.Sprintf("%d", index+1)
			}
			params = append(params, interface{}(v))

		}
		return fKey, "IN", "(" + res + ")", params, nil
	}

	if strings.Contains(fValue, "%") {
		fOperator = "LIKE"
	}

	params = []any{fValue}
	return fKey, fOperator, "$1", params, nil
}

func GetFilterSQL(filterStr string) (string, []any, error) {
	filters := strings.Split(filterStr, ";")
	sql := ""
	var params []any
	sqlPartial := ""
	for _, filter := range filters {
		fKey, fOperator, fValuePlaceholder, conditionParams, err := getFilterConditionParts(filter)
		if err != nil {
			return "", nil, filterError
		}

		fSpecialSQL, isSpecialFilter := getFilterSpecialSQL(fKey, fOperator, fValuePlaceholder)

		if isSpecialFilter {
			sqlPartial = fSpecialSQL
		} else {
			sqlPartial = fmt.Sprintf("%s %s %s", fKey, fOperator, fValuePlaceholder)
		}
		if sql == "" {
			sql = sqlPartial
		} else {
			sql = sql + " AND" + sqlPartial
		}
		params = append(params, conditionParams...)

	}
	return sql, params, nil
}
