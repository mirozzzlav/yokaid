export const proxyApiSuffix = '/api';

export default {
  auth: {
    tokenType: 'bearer',
  },
  api: {
    url: `${window.location.origin}${proxyApiSuffix}`, // Proxy api url instead of real one
    endPoints: {
      loginUser: { path: 'users/login', isPrivate: false },
      books: { path: 'books', isPrivate: true },
    },
  },
};
