export const proxyApiSuffix = '/api';

const apiUrl = `${window.location.origin}${proxyApiSuffix}`;

const defualtMapBounds = [
  51.48801054716571, -0.1518344879150391, 51.52198884392169,
  -0.028238296508789066,
];
const defualtMapPosition = [51.505, -0.09];
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
      addProfessionalWithReview: `${apiUrl}/professionals/add`,
    },
  },
  map: {
    defaultZoom: 14,
    defaultPosition: defualtMapPosition,
    defaultBounds: defualtMapBounds,
    columnAlias: mapFilterColumnAlias,
    defaultArea: {
      position: defualtMapPosition,
      bounds: defualtMapBounds,
    },
  },
  defaultFilter: {
    [mapFilterColumnAlias]: {
      value: defualtMapBounds,
      extraData: defualtMapPosition,
    },
  },
  maxRating: 5,
};
