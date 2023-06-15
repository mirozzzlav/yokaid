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

type FilterStoreGetter struct {
	Filter string
}

func (f FilterStoreGetter) GetStoreRequest() (common.StoreRequest, error) {
	filters := strings.Split(f.Filter, ";")
	sql := ""
	var params []any
	sqlPartial := ""
	for _, filter := range filters {
		fKey, fOperator, fValuePlaceholder, conditionParams, err := getFilterConditionParts(filter)
		if err != nil {
			return common.StoreRequest{}, filterError
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
	return common.StoreRequest{Query: sql, Params: params}, nil
}
