function toSnakeCase(camelCase) {
  return camelCase.replace(/([a-z0-9]+)([A-Z])/g, '$1_$2').toLowerCase();
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

function toLocalDate(dateStr) {
  return new Date(dateStr).toLocaleString('sk-SK', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

/* UTC is almost the same as GMT-0 - not a subject to time zone
 variations or daylight saving time changes. */
function toUTCDate(d, endOfDay = false) {
  return new Date(
    Date.UTC(
      ...[d.getFullYear(), d.getMonth(), d.getDate()],
      ...(endOfDay ? [23, 59, 59, 999] : [0, 0, 0, 1]),
    ),
  ).toISOString();
}

function isFieldRequired(rule) {
  if (!rule) {
    return false;
  }
  return rule.match(/\brequired\b/) !== null;
}

function isBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}
function isInt(str) {
  return !Number.isNaN(parseInt(str, 10));
}

export {
  unknownObjectValidator,
  toSnakeCase,
  getTokenFromResponse,
  toLocalDate,
  toUTCDate,
  isFieldRequired,
  isBase64,
  isInt,
};
