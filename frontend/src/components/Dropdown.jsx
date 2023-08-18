import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useOutsideClick,
} from '@chakra-ui/react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { SearchIcon } from '@chakra-ui/icons';
import { theme } from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import { FilterContext, LoaderContext } from 'src/providers';
import { useDelayedAction } from 'src/hooks';

const style = {
  dropdownContainer: {
    position: 'relative',
  },
  list: (isShown, position, width) => {
    let positionStyle = { left: 0 };
    if (position === 'center') {
      positionStyle = { left: `calc(50% - ${width}/2)` };
    }
    if (position === 'right') {
      positionStyle = { right: 0 };
    }
    return {
      marginTop: '5px',
      position: 'absolute',
      background: '#fff',
      padding: '1rem 0',
      borderRadius: theme.radii.md,
      boxShadow: theme.shadows.md,
      width,
      ...positionStyle,
      overflow: 'hidden',
      ...(!isShown ? { display: 'none' } : null),
    };
  },
  listElem: {
    width: '100%',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: 'block',
    borderRadius: 0,
    padding: '0 1rem',
  },
};

function DropdownList({
  items,
  onItemClick,
  setIsShown,
  isShown,
  position,
  width,
}) {
  return (
    <Box
      sx={{
        ...style.list(isShown, position, width),
      }}
    >
      {items.length === 0 ? (
        <Box sx={style.listElem}>no results</Box>
      ) : (
        <Box>
          {items.map(({ label, value, ...restItem }) => (
            <Button
              sx={style.listElem}
              variant="ghost"
              key={`${
                typeof value === 'object' ? JSON.stringify(value) : value
              }`}
              onClick={() => {
                if (restItem.onClick) {
                  restItem.onClick({
                    label,
                    value,
                    ...restItem,
                  });
                } else if (onItemClick) {
                  onItemClick({
                    label,
                    value,
                    ...restItem,
                  });
                }
                setIsShown(false);
              }}
            >
              {`${label}`}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    onClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
    filterColumnAlias: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.oneOf([null, undefined]),
    ]),
  }),
);

DropdownList.defaultProps = {
  onItemClick: null,
};
DropdownList.propTypes = {
  items: itemsPropType.isRequired,
  onItemClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  setIsShown: PropTypes.func.isRequired,
  position: PropTypes.string.isRequired,
  isShown: PropTypes.bool.isRequired,
  width: PropTypes.string.isRequired,
};

function Dropdown({ items, buttonMeta, position, width }) {
  const wrapperRef = useRef();
  const [isShown, setIsShown] = useState(false);
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });

  return (
    <Box ref={wrapperRef} sx={style.dropdownContainer}>
      <Button
        onClick={() => setIsShown((prevShown) => !prevShown)}
        variant={buttonMeta.variant}
        sx={buttonMeta.style}
      >
        {buttonMeta.content}
      </Button>

      <DropdownList
        items={items}
        setIsShown={setIsShown}
        position={position}
        isShown={isShown}
        width={width}
      />
    </Box>
  );
}

Dropdown.defaultProps = {
  items: null,
  position: 'right',
  width: '300px',
};
Dropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
      ]),
    }),
  ),
  buttonMeta: PropTypes.shape({
    content: PropTypes.node,
    variant: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.oneOf([null]),
      unknownObjectValidator,
    ]),
  }).isRequired,
  position: PropTypes.string,
  width: PropTypes.string,
};

function SearchDropdown({
  placeholder,
  searchHook,
  initialItems,
  icon,
  onItemClick: onItemClickFromProps,
  onInputEmpty,
  position,
  showLoader,
  width,
}) {
  const { resetFilters } = useContext(FilterContext);
  const [inputVal, setInputVal] = useState('');
  const { isLoading } = useContext(LoaderContext);
  const wrapperRef = useRef();
  const [isShown, setIsShown] = useState(false);
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });
  const [items, setItems] = useState(initialItems || []);
  const delayedCall = useDelayedAction();

  const searchCall = searchHook((responseItems) => {
    if (inputVal === '') {
      // this is risky, inputVal is uncertain in the callback context, but it works
      return;
    }

    setItems(responseItems || []);
    setIsShown(true);
  });
  const onItemClick = useCallback(
    (onClickData) => {
      onItemClickFromProps(onClickData);
      setInputVal(onClickData.label);
    },
    [onItemClickFromProps],
  );

  const onInputFocus = useCallback(() => {
    setItems((prevItems) => {
      if (prevItems.length > 0) {
        return prevItems;
      }
      if (initialItems?.length) {
        return initialItems;
      }
      return [];
    });
    setIsShown(!!initialItems);
  }, [initialItems]);

  const onInputChange = useCallback(
    (e) => {
      const v = e.target.value;
      setInputVal(v);
      if (v === '') {
        setItems(initialItems || []);
        setIsShown(!!initialItems);
        resetFilters();
        if (onInputEmpty) {
          onInputEmpty();
        }
      } else {
        delayedCall(searchCall, v);
      }
    },
    [initialItems],
  );

  return (
    <Box sx={style.dropdownContainer} ref={wrapperRef}>
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={onInputFocus}
          value={inputVal}
        />

        <InputRightElement>
          {showLoader && isLoading ? <Spinner /> : icon}
        </InputRightElement>
      </InputGroup>

      <DropdownList
        items={items}
        onItemClick={onItemClick}
        setIsShown={setIsShown}
        isShown={isShown}
        position={position}
        width={width}
      />
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: 'search something',
  icon: <SearchIcon />,
  position: 'right',
  showLoader: false,
  initialItems: null,
  width: '300px',
  onInputEmpty: null,
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchHook: PropTypes.func.isRequired,
  initialItems: PropTypes.oneOfType([itemsPropType, PropTypes.oneOf([null])]),
  icon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
  onInputEmpty: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  position: PropTypes.string,
  showLoader: PropTypes.bool,
  width: PropTypes.string,
};

export { Dropdown, SearchDropdown };
