export const proxyApiSuffix = '/api';

export default {
  auth: {
    tokenType: 'bearer',
  },
  api: {
    url: `${window.location.origin}${proxyApiSuffix}`, // Proxy api url instead of real one
    endPoints: {
      loginUser: 'users/login',
      books: 'books',
    },
  },
};
