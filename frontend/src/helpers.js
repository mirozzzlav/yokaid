function toSnakeCase(camelCase) {
  return camelCase.replace(/([a-z0-9]+)([A-Z])/g, '$1_$2').toLowerCase();
}

function objToSnakeCase(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnakeCase(k), v]),
  );
}

function unknownObjectValidator(props, propName, componentName) {
  if (props[propName] !== null && typeof props[propName] !== 'object') {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}'.` +
        ` Expected an object or null, but received '${typeof props[
          propName
        ]}'.`,
    );
  }
  return null;
}

function getTokenFromResponse(response, httpErrorCode) {
  if (response.error || httpErrorCode === '401') {
    return null;
  }

  if (response?.data.access_token) {
    return response?.data.access_token;
  }

  if (response.refresh_token) {
    return response.refresh_token;
  }

  return null;
}

export {
  unknownObjectValidator,
  toSnakeCase,
  objToSnakeCase,
  getTokenFromResponse,
};
