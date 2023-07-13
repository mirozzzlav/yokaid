import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useOutsideClick,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { SearchIcon } from '@chakra-ui/icons';
import { theme } from 'src/style';

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

function Dropdown({ items, onItemClick }) {
  const wrapperRef = useRef();
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => setShowDropdown(true), [JSON.stringify(items)]);

  useOutsideClick({
    ref: wrapperRef,
    handler: () => setShowDropdown(false),
  });

  const onItemClickCallback = useCallback(
    (itemValue) => {
      onItemClick(itemValue);
      setShowDropdown(false);
    },
    [onItemClick],
  );

  return (
    showDropdown && (
      <Box sx={style.list} ref={wrapperRef}>
        {items.length === 0 ? (
          <Box sx={style.listElem}>no results</Box>
        ) : (
          <>
            {items.map(({ text: itemText, value: itemValue, id }) => (
              <Button
                sx={style.listElem}
                variant="ghost"
                key={`${id}`}
                onClick={() => onItemClickCallback(itemValue)}
              >
                {`${itemText}`}
              </Button>
            ))}
          </>
        )}
      </Box>
    )
  );
}

Dropdown.defaultProps = {
  items: null,
};
Dropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
      ]),
    }),
  ),
  onItemClick: PropTypes.func.isRequired,
};

function SearchDropdown({
  placeholder,
  searchResponseGetter,
  icon,
  onItemClick,
}) {
  const valueRef = useRef('');

  const { foundItems, searchCall, responseMeta } = searchResponseGetter();

  const timeout = useRef(null);

  const onInputChange = useCallback((v) => {
    valueRef.current = v;
    if (timeout.current) {
      return;
    }

    timeout.current = setTimeout(() => {
      searchCall(valueRef.current);
      timeout.current = null;
    }, 500);
  }, []);

  return (
    <Box sx={style.container}>
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <InputRightElement>
          {responseMeta.isLoading ? <Spinner /> : icon}
        </InputRightElement>
      </InputGroup>
      {responseMeta.isReady && (
        <Dropdown items={foundItems} onItemClick={onItemClick} />
      )}
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: 'search something',
  icon: <SearchIcon />,
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchResponseGetter: PropTypes.func.isRequired,
  icon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
};

export { Dropdown, SearchDropdown };
