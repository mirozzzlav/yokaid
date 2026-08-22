import React, { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';
import { getLocalDataValue, setLocalDataValue, sprintf } from 'src/helpers';
import useCall from 'src/hooks/useCall';

export const TranslationsContext = React.createContext({});

export function TagTranslation({ msgId, msgParts, n }) {
  const { translations, lang } = useContext(TranslationsContext);

  if (!translations?.[msgId]) {
    return msgId;
  }

  const msg = translations[msgId].split(';')[config.pluralFormGetter(lang)(n)];

  if (!msgParts || msgParts.length === 0) {
    return msg;
  }

  return msg.split(/%[sdv]+/).reduce(
    (prev, current, index) =>
      index < msgParts.length ? (
        <>
          {prev}
          {current}
          {msgParts[index]}
        </>
      ) : (
        <>
          {prev}
          {current}
        </>
      ),
    '',
  );
}

TagTranslation.defaultProps = {
  msgParts: null,
  n: 1,
};

TagTranslation.prototype.propTypes = {
  msgId: PropTypes.string.isRequired,
  msgParts: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.oneOf([null]),
  ]),
  n: PropTypes.number,
};

export default function TranslationsProvider({ children }) {
  const [lang, setLang] = useState(
    getLocalDataValue('languages', 'currentLang') || config.defaultLanguage,
  );
  const [translations, setTranslations] = useState(null);
  const { call } = useCall((response) => {
    setTranslations(response.data);
  });

  const contextVal = useMemo(
    () => ({
      lang,
      setLang,
      translations,
      T: (msgId, msgParts = [], n = 1) => {
        if (!translations?.[msgId]) {
          return msgId;
        }
        return sprintf(
          translations[msgId].split(';')[config.pluralFormGetter(lang)(n)],
          msgParts,
        );
      },
    }),
    [lang, translations],
  );

  useEffect(() => {
    call(config.api.endPointsURLs.getTranslations, [lang]);
    setLocalDataValue('languages', 'currentLang', lang);
  }, [lang]);

  return (
    <TranslationsContext.Provider value={contextVal}>
      {children}
    </TranslationsContext.Provider>
  );
}

TranslationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
