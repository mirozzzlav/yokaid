export const proxyApiSuffix = '/api';

const apiUrl = `${window.location.origin}${proxyApiSuffix}`;

const defaultMapBounds = [47.7311798, 16.8331891, 49.6138162, 22.56571];
const defaultMapPosition = [48.7411522, 19.4528646];

const mapFilterColumnAlias = 'mapBounds';

const filterElements = [
  {
    name: 'location',
    placeholder: 'Location',
    infoPlaceholder: 'anywhere',
    iconName: 'LocationIcon',
  },
  {
    name: 'profession',
    placeholder: 'Profession',
    infoPlaceholder: 'any profession',
    iconName: 'WorkerIcon',
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
      getFilterItems: `${apiUrl}/filter-items/get`,
      createProfessionalWithReview: `${apiUrl}/professionals/create-with-review`,
      createReview: `${apiUrl}/reviews/create`,
      getProfessions: `${apiUrl}/professions/get`,
      handleProfessionalContact: `${apiUrl}/professionals/handle-contact`,
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
  filter: {
    elements: filterElements,
    getNames: () => filterElements.map(({ name }) => name),
    APIColumnAliases: {
      profession: 'professionId',
      location: mapFilterColumnAlias,
    },
    defaultFilter: {
      location: {
        columnAlias: mapFilterColumnAlias,
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
    label: 'Your Phone',
    inputFormat: '+421 9xx xxx xxx',
    validationRules: 'required,phone',
  },
};
