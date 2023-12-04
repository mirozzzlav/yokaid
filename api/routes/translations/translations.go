package translations

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/leonelquinteros/gotext"
	"net/http"
	"regexp"
	"strings"
	"yokaid/api/common"
)

func getTranslation(trs map[int]string) string {

	var trsSlice = make([]string, len(trs))
	for kIndex, t := range trs {
		trsSlice[kIndex] = t
	}
	return strings.Join(trsSlice, ";")
}

func getTranslations(lang string) map[string]string {

	locale := gotext.NewLocale(common.Config.Translations.Root, lang)
	locale.AddDomain(common.Config.Translations.DefaultDomain)
	resultMap := make(map[string]string)
	for key, translation := range locale.GetTranslations() {
		if key != "" {
			resultMap[key] = getTranslation(translation.Trs)
		}
	}
	return resultMap

}

func GetRoutes(_ common.Server) []common.Route {

	return []common.Route{
		common.NewRoute(
			"/translations/get/:lang",
			http.MethodGet,
			func(ctx *gin.Context) {
				lang, exist := ctx.Params.Get("lang")
				if !exist || !regexp.MustCompile("[a-z]{2}_[A-Z]{2}").MatchString(lang) {
					lang = common.Config.DefaultLanguage
				}
				session := sessions.Default(ctx)
				session.Set("lang", lang)
				session.Save()
				common.SetOKJSONResponse(ctx, "", getTranslations(lang))
			},
		),
	}
}
