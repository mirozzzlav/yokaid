import React, { useMemo } from 'react';
import { Dropdown } from 'src/components/Dropdown';
import Icons from 'src/components/Icons';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import theme from 'src/style';

const style = {
  dropdownItem: {
    '> svg': { marginRight: theme.space[2], marginTop: '-3px' },
  },
};

export default function LanguageDropdown({
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
