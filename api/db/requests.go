package db

import "rental-app/api/common"

func GetProfessionalsRequest(reqGetters []common.StoreRequestGetter) (common.StoreRequest, error) {
	query := "SELECT * FROM (" +
		"SELECT u.fullname, p.rating, json_agg(jsonb_build_object('name', s.name, 'desc', s.desc)) as services " +
		"FROM professionals p, users u, professionals_services ps, services s " +
		"WHERE p.user = u.id AND ps.professional = p.id AND ps.service = s.name " +
		"GROUP BY u.username, u.fullname, p.rating" +
		") AS pros WHERE 1=1 "

	req, err := common.GetStoreRequest(query, reqGetters...)
	if err != nil {
		return common.StoreRequest{}, err
	}

	return req, nil

}
