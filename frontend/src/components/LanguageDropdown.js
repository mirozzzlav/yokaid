import React, { useMemo } from 'react';
import { Dropdown } from 'src/components/Dropdown';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import theme from 'src/style';
import { FlagIcon } from 'src/assets';

const style = {
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.space[2],
  },
};

export default function LanguageDropdown({
  languages,
  onLanguageSelect,
  selectedLanguage,
}) {
  const currentLangIconName = useMemo(
    () => languages.find(({ value }) => value === selectedLanguage).value,
    [languages, selectedLanguage],
  );

  return (
    <Dropdown
      onItemClick={onLanguageSelect}
      buttonMeta={{
        content: <FlagIcon lang={currentLangIconName} />,
        variant: 'ghost',
        style: {
          padding: '2px 8px 2px 4px',
        },
      }}
      items={languages.map(({ label, value }) => ({
        value,
        content: (
          <Box sx={style.dropdownItem}>
            <FlagIcon lang={value} />
            {label}
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
