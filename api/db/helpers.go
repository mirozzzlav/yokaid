package db

import (
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

	_, err = sH.QueryRunner.Exec(q)
	if err != nil {
		return 0, err
	}

	return professionalId, nil

}

func (sH *StoreHelpers) CreateProfessionalContactWithPayment(req common.CreateUserProfessionalContactRequest, paymentState string) (string, error) {
	q := sH.QueriesRepo.GetProfessionalContactQuery(req.ProfessionalId, req.UserId, "payments.id")
	paymentIdAny, err := sH.QueryRunner.GetScalar(q)
	if err != nil && err != common.ErrNoRows {
		return "", err
	}

	if err == common.ErrNoRows {
		q = sH.QueriesRepo.CreatePaymentQuery(
			common.GenerateUniqueID(), req.UserId, "con", paymentState)
		paymentIdAny, err = sH.QueryRunner.Exec(q)
		if err != nil {
			return "", err
		}

		paymentId, _ := paymentIdAny.(string)
		q = sH.QueriesRepo.CreateProfessionalContactQuery(paymentId, req)
		_, err = sH.QueryRunner.Exec(q)
		if err != nil {
			return "", err
		}

		return paymentId, nil
	}

	// if contact exist and its paid already
	return paymentIdAny.(string), common.ErrRecordExist

}
