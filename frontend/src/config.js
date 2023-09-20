export const proxyApiSuffix = '/api';

const apiUrl = `${window.location.origin}${proxyApiSuffix}`;

const defaultMapBounds = [
  51.48801054716571, -0.1518344879150391, 51.52198884392169,
  -0.028238296508789066,
];
const defaultMapPosition = [51.505, -0.09];
const mapFilterColumnAlias = 'mapBounds';

export default {
  auth: {
    tokenType: 'bearer',
  },
  api: {
    url: apiUrl, // Proxy api url instead of real one
    endPointsURLs: {
      loginUser: `${apiUrl}/users/login`,
      signupUser: `${apiUrl}/users/register`,
      getProfessionals: `${apiUrl}/professionals/get`,
      getProfessionalsInfo: `${apiUrl}/professionals/get-info`,
      getInitialData: `${apiUrl}/frontend-data/get`,
      getFilterItems: `${apiUrl}/filter-items/get`,
      createProfessionalWithReview: `${apiUrl}/professionals/create-with-review`,
      createReview: `${apiUrl}/reviews/create`,
      getServices: `${apiUrl}/services/get`,
    },
  },
  map: {
    defaultZoom: 14,
    defaultPosition: defaultMapPosition,
    defaultBounds: defaultMapBounds,
    columnAlias: mapFilterColumnAlias,
    defaultArea: {
      position: defaultMapPosition,
      bounds: defaultMapBounds,
    },
  },
  defaultFilter: {
    [mapFilterColumnAlias]: {
      value: defaultMapBounds,
      extraData: defaultMapPosition,
    },
  },
  maxRating: 5,
};
