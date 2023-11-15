import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useOutsideClick,
} from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, SearchIcon, SmallCloseIcon } from '@chakra-ui/icons';
import theme from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import useDelayedAction from 'src/hooks/useDelayedAction';
import { LoaderContext } from 'src/providers/LoaderProvider';
import { WindowScrollContext } from 'src/providers/WindowScrollProvider';

const listElemStyle = {
  width: '100%',
  textAlign: 'left',
  borderRadius: 0,
};
const style = {
  list: (isShown, thinScreen = false) => ({
    background: theme.colors.white,
    borderRadius: theme.radii.base,
    border: `1px solid ${theme.colors.gray[300]}`,
    overflowX: 'hidden',
    overflowY: 'auto',
    ...(!isShown ? { display: 'none' } : null),
    ...(thinScreen ? { maxHeight: '150px' } : null),
    boxShadow: theme.shadows.base,
  }),
  noResults: {
    ...listElemStyle,
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
  },
  listElem: {
    ...listElemStyle,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: 'block',
    fontWeight: theme.fontWeights.normal,
    ':hover': {
      background: theme.colors.gray[50],
    },
    ':focus-visible': {
      boxShadow: 'none',
      fontWeight: theme.fontWeights.bold,
    },
    '> *': {
      padding: '0.5rem 0',
      margin: '0 1rem',
    },
    ':last-child > *': {
      border: 'none',
    },
  },
  searchDropdownWrapper: {
    flexGrow: 1,
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
  const { thinScreen } = useContext(WindowScrollContext);
  return (
    <Box
      sx={{
        ...style.list(isShown, thinScreen),
        ...theme.styles.global.contextMenuLikeChild(position, width),
      }}
    >
      {items.length === 0 ? (
        <Box sx={style.noResults}>no results</Box>
      ) : (
        <Box>
          {items.map(({ label, value, ...restItem }, i) => (
            <Box
              sx={style.listElem}
              onBlur={() => i === items.length - 1 && setIsShown(false)}
              variant="ghost"
              key={`${label}${
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
              <Box>{restItem.content || `${label}`}</Box>
            </Box>
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

function Dropdown({ items, buttonMeta, position, width, onItemClick }) {
  const wrapperRef = useRef();
  const [isShown, setIsShown] = useState(false);
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });

  return (
    <Box ref={wrapperRef} sx={theme.styles.global.contextMenuLikeWrapper}>
      <Button
        onClick={() => setIsShown((prevShown) => !prevShown)}
        variant={buttonMeta.variant}
        sx={buttonMeta.style}
        leftIcon={<ChevronDownIcon />}
      >
        {buttonMeta.content}
      </Button>

      <DropdownList
        onItemClick={onItemClick}
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
  onItemClick: null,
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
  onItemClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};

function SearchDropdown({
  placeholder,
  searchHook,
  initialItems,
  inputVal: inputValFromProps,
  inputValSetter: inputValSetterFromProps,
  setInputValOnValSet,
  icon,
  onValueSet,
  onValueEmpty,
  position,
  showLoader,
  showCloseIcon,
  dropdownWidth,
  sx,
}) {
  const { isLoading } = useContext(LoaderContext);
  const wrapperRef = useRef();
  const [isShown, setIsShown] = useState(false);
  const [items, setItems] = useState(initialItems || []);
  const delayedCall = useDelayedAction();
  let [inputVal, inputValSetter] = useState('');

  if (inputValFromProps !== null && inputValSetterFromProps !== null) {
    inputVal = inputValFromProps;
    inputValSetter = inputValSetterFromProps;
  }
  const [inputFocus, setInputFocus] = useState(false);

  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });

  const searchCall = searchHook((results) => {
    if (inputVal === '' || !inputFocus) {
      // this is risky, inputVal is uncertain in the callback context, but it works
      return;
    }

    setItems(results || []);
    setIsShown(true);
  });
  const onItemClick = useCallback(
    (onClickData) => {
      onValueSet(onClickData);
      if (setInputValOnValSet) {
        inputValSetter(onClickData.label);
      } else {
        inputValSetter('');
      }
    },
    [onValueSet],
  );

  const onInputFocus = useCallback(() => {
    setInputFocus(true);
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

  const resetDropdown = useCallback(() => {
    setItems(initialItems || []);
    setIsShown(!!initialItems);
    onValueEmpty();
  }, [initialItems, onValueEmpty]);

  const onInputChange = useCallback(
    (e) => {
      const v = e.target.value;
      if (v === '') {
        resetDropdown();
      } else {
        delayedCall(searchCall, v);
      }
      inputValSetter(v);
    },
    [initialItems],
  );

  const inputIcon = useMemo(() => {
    if (showLoader && isLoading) {
      return <Spinner />;
    }

    if (inputVal !== '' && showCloseIcon) {
      return (
        <SmallCloseIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            inputValSetter('');
            onValueEmpty();
          }}
        />
      );
    }
    return icon;
  }, [showLoader, isLoading, icon, onValueEmpty, inputVal, showCloseIcon]);

  useEffect(() => {
    if (!inputFocus && items.length === 0) {
      // hide dropdown only when 0 results, it is hidden on different place when >0 items
      setIsShown(false);
    }
  }, [inputFocus, items]);

  return (
    <Box
      sx={{
        ...theme.styles.global.contextMenuLikeWrapper,
        ...style.searchDropdownWrapper,
        ...sx,
      }}
      ref={wrapperRef}
    >
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={onInputFocus}
          value={inputVal}
          onBlur={() => setInputFocus(false)}
        />

        <InputRightElement>{inputIcon}</InputRightElement>
      </InputGroup>

      <DropdownList
        items={items}
        onItemClick={onItemClick}
        setIsShown={setIsShown}
        isShown={isShown}
        position={position}
        width={dropdownWidth}
      />
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: '',
  icon: <SearchIcon />,
  position: 'right',
  showLoader: false,
  showCloseIcon: true,
  initialItems: null,
  inputVal: null,
  inputValSetter: null,
  setInputValOnValSet: true,
  dropdownWidth: '300px',
  onValueEmpty: () => {},
  sx: null,
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchHook: PropTypes.func.isRequired,
  initialItems: PropTypes.oneOfType([itemsPropType, PropTypes.oneOf([null])]),
  inputVal: PropTypes.string,
  inputValSetter: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf([null]),
  ]),
  setInputValOnValSet: PropTypes.bool,
  icon: PropTypes.node,
  onValueSet: PropTypes.func.isRequired,
  onValueEmpty: PropTypes.func,
  position: PropTypes.string,
  showLoader: PropTypes.bool,
  showCloseIcon: PropTypes.bool,
  dropdownWidth: PropTypes.string,
  sx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
};

export { Dropdown, SearchDropdown };
