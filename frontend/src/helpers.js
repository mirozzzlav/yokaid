import Sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';

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

function isInt(str) {
  return !Number.isNaN(parseInt(str, 10));
}
function getMergedStyle(style, style2) {
  if (!style2) {
    return style;
  }
  const res = { ...style };
  Object.keys(style2).forEach((k) => {
    if (typeof style2[k] === 'string') {
      res[k] = style2[k];
    } else {
      res[k] = { ...style[k], ...style2[k] };
    }
  });
  return res;
}

function getStringFirstCaps(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

function setLocalDataValue(storageKey, dataKey, dataValue) {
  let data = localStorage.getItem(storageKey) || '{}';
  data = JSON.parse(data);
  localStorage.setItem(
    storageKey,
    JSON.stringify({ ...data, [dataKey]: dataValue }),
  );
}

function getLocalDataValue(storageKey, dataKey) {
  let data = localStorage.getItem(storageKey);
  if (!data) {
    return null;
  }
  data = JSON.parse(data);
  return !data[dataKey] ? null : data[dataKey];
}

function getHexSHA256(inputString) {
  return Sha256(inputString).toString(encHex);
}

function generateUUID(base = 10) {
  return new Date().getTime().toString(base);
}

function sprintf(string, textParts) {
  if (textParts.length === 0) {
    return string;
  }
  return textParts.reduce(
    (previousValue, currentValue) => previousValue.replace(/%[sdv]/, currentValue),
    string,
  );
}

function formatPhoneNumber(inputNumber) {
  let phoneNumber;
  if (
    inputNumber.length === 0 ||
    (inputNumber.length === 1 && inputNumber !== '+')
  ) {
    phoneNumber = '';
  } else {
    phoneNumber = `+${inputNumber.substring(1).replaceAll(/[^\d]/g, '')}`
      .replace(/(\d{3})/g, '$1 ')
      .trim();
  }

  if (phoneNumber.length > 16) {
    phoneNumber = phoneNumber.substring(0, 16);
  }
  return phoneNumber;
}

export {
  unknownObjectValidator,
  toSnakeCase,
  toLocalDate,
  toUTCDate,
  isFieldRequired,
  isInt,
  getMergedStyle,
  getStringFirstCaps,
  setLocalDataValue,
  getLocalDataValue,
  getHexSHA256,
  sprintf,
  generateUUID,
  formatPhoneNumber,
};
