package db

import (
	"encoding/json"
	"yokaid/api/common"
)

func professionalsModelLoader() (*[]common.Professional, func(rowBytes []byte)) {
	var professionals []common.Professional

	return &professionals, func(rowBytes []byte) {
		var pro common.Professional
		_ = json.Unmarshal(rowBytes, &pro)
		professionals = append(professionals, pro)
	}
}

func professionsModelLoader() (*[]common.Profession, func(rowBytes []byte)) {
	var professions []common.Profession
	return &professions, func(rowBytes []byte) {
		var profession common.Profession
		_ = json.Unmarshal(rowBytes, &profession)
		professions = append(professions, profession)
	}
}

func contactsModelLoader() (*[]common.Contact, func(rowBytes []byte)) {
	var contacts []common.Contact
	return &contacts, func(rowBytes []byte) {
		var req common.Contact
		_ = json.Unmarshal(rowBytes, &req)
		contacts = append(contacts, req)
	}
}
