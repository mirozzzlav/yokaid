export const proxyApiSuffix = '/api';

const apiUrl = `${window.location.origin}${proxyApiSuffix}`;
export default {
  auth: {
    tokenType: 'bearer',
  },
  api: {
    url: apiUrl, // Proxy api url instead of real one
    endPointsURLs: {
      loginUser: `${apiUrl}/users/login`,
      getMapPosts: `${apiUrl}/posts/list`,
    },
  },
};
