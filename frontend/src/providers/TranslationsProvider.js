import React, { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'src/components/Dropdown';
import Icons from 'src/components/Icons';
import { Box } from '@chakra-ui/react';
import theme from 'src/style';
import config from 'src/config';
import { getLocalDataValue, setLocalDataValue, sprintf } from 'src/helpers';
import useCall from 'src/hooks/useCall';

export const TranslationsContext = React.createContext({});

const style = {
  dropdownItem: {
    '> svg': { marginRight: theme.space[2], marginTop: '-3px' },
  },
};
export function LanguageDropdown({
  languages,
  onLanguageSelect,
  selectedLanguage,
}) {
  const currentLangIconName = useMemo(
    () => languages.find(({ value }) => value === selectedLanguage).iconName,
    [languages, selectedLanguage],
  );

  return (
    <Dropdown
      onItemClick={onLanguageSelect}
      buttonMeta={{
        content: React.createElement(Icons[currentLangIconName]),
        variant: 'ghost',
        style: {
          '> svg': { marginTop: '-3px' },
          padding: '2px 8px 2px 4px',
        },
      }}
      items={languages.map(({ iconName, ...rest }) => ({
        ...rest,
        content: (
          <Box sx={style.dropdownItem}>
            {React.createElement(Icons[iconName])}
            {rest.label}
          </Box>
        ),
      }))}
      width="200px"
    />
  );
}

LanguageDropdown.prototype.propTypes = {
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ).isRequired,
  onLanguageSelect: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
};

export function TagTranslation({ msgId, msgParts, n }) {
  const { translations, lang } = useContext(TranslationsContext);

  if (!translations?.[msgId]) {
    return msgId;
  }

  const msg = translations[msgId].split(';')[config.pluralFormGetter(lang)(n)];

  if (!msgParts || msgParts.length === 0) {
    return msg;
  }

  return msg.split(/\$[0-9]+/).reduce(
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
