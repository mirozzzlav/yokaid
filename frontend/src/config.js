const apiUrl = `${window.location.origin}/api`;

const defaultMapBounds = [47.7311798, 16.8331891, 49.6138162, 22.56571];
const defaultMapPosition = [48.7411522, 19.4528646];

const mapColumnAlias = 'mapBounds';

const filterElements = [
  {
    name: 'profession',
    placeholder: 'profession',
    infoPlaceholder: 'any profession',
    iconName: 'WorkerIcon',
    valueMapper: ({ id }) => id,
  },
  {
    name: 'location',
    placeholder: 'location',
    infoPlaceholder: 'anywhere',
    iconName: 'LocationIcon',
  },
];

export default {
  api: {
    url: apiUrl, // Proxy api url instead of real one
    endPointsURLs: {
      getProfessionals: `${apiUrl}/professionals/get`,
      getProfessionalDetail: `${apiUrl}/professionals/get-detail`,
      searchProfessionals: `${apiUrl}/professionals/search`,
      getInitialData: `${apiUrl}/frontend-data/get`,
      getList: `${apiUrl}/list/get`,
      createProfessionalWithReview: `${apiUrl}/professionals/create-with-review`,
      createReview: `${apiUrl}/reviews/create`,
      getProfessions: `${apiUrl}/professions/get`,
      handleProfessionalContact: `${apiUrl}/professionals/handle-contact`,
      getTranslations: `${apiUrl}/translations/get`,
    },
  },
  map: {
    defaultZoom: 14,
    defaultPosition: defaultMapPosition,
    defaultBounds: defaultMapBounds,
    defaultArea: {
      position: defaultMapPosition,
      bounds: defaultMapBounds,
    },
  },
  APIColumnAliases: {
    profession: 'professionId',
    location: mapColumnAlias,
  },
  filter: {
    elements: filterElements,
    getNames: () => filterElements.map(({ name }) => name),
    defaultFilter: {
      location: {
        columnAlias: mapColumnAlias,
        value: defaultMapBounds,
        extraData: defaultMapPosition,
      },
    },
  },
  maxRating: 5,
  refreshInterval: 5000,
  maxReviewImages: 8,
  userIdMeta: {
    name: 'userId',
    label: 'your phone',
    inputFormat: '+421 9xx xxx xxx',
    validationRules: 'required,phone',
    inputType: 'tel',
  },
  defaultLanguage: 'en_US',
  languages: [
    { value: 'en_US', label: 'English', iconName: 'USIcon' },
    { value: 'sk_SK', label: 'Slovenčina', iconName: 'SKIcon' },
  ],
  pluralFormGetter: (lang) =>
    ({
      en_US: (n) => (n !== 1 ? 1 : 0),
      sk_SK: (n) => {
        if (n === 1) {
          return 0;
        }
        return n >= 2 && n <= 4 ? 1 : 2;
      },
    }[lang]),
};
