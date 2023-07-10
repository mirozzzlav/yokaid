import { Box, Button, Input, extendTheme } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import OutClickDetector from 'src/components/OutClickDetector';

// Extend the default Chakra UI theme to access shadow styles
const theme = extendTheme();

const style = {
  container: {
    position: 'relative',
  },
  list: {
    position: 'absolute',
    top: '50px',
    width: '100%',
    left: 0,
    background: '#fff',
    padding: '1rem 0',
    borderRadius: theme.radii.md,
    boxShadow: theme.shadows.md,
  },
  listElem: {
    width: '100%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: 'block',
    borderRadius: 0,
    padding: '0 1rem',
  },
};

function DropdownItems({ items }) {
  const counter = useRef(0);

  useEffect(() => {
    counter.current += 1;
  });

  return (
    <OutClickDetector id={counter.current}>
      <Box sx={style.list}>
        {items.length === 0 ? (
          <Box sx={style.listElem}>no results</Box>
        ) : (
          <>
            {items.map(({ text: itemText, value: itemValue, id }) => (
              <Button sx={style.listElem} variant="ghost" key={`${id}`}>
                {`${itemText}`}
              </Button>
            ))}
          </>
        )}
      </Box>
    </OutClickDetector>
  );
}

DropdownItems.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ text: PropTypes.string, value: PropTypes.string }),
  ).isRequired,
};

export default function SearchDropdown({ placeholder, searchResponseGetter }) {
  const valueRef = useRef('');
  const { searchResponse: searchResponseItems, search } =
    searchResponseGetter();

  const timeout = useRef(null);

  const onInputChange = useCallback((v) => {
    valueRef.current = v;
    if (timeout.current) {
      return;
    }

    timeout.current = setTimeout(() => {
      search(valueRef.current);
      timeout.current = null;
    }, 1000);
  }, []);

  useEffect(() => {}, [searchResponseItems]);

  return (
    <Box sx={style.container}>
      <Input
        placeholder={placeholder}
        onChange={(e) => onInputChange(e.target.value)}
      />
      {searchResponseItems !== null && (
        <DropdownItems items={searchResponseItems} />
      )}
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: 'search something',
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchResponseGetter: PropTypes.func.isRequired,
};
