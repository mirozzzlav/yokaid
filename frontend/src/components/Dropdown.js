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
  forwardRef,
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
import { WindowContext } from 'src/providers/WindowProvider';
import Overlay from 'src/components/Overlay';
import { TranslationsContext } from 'src/providers';
import Loader from 'src/components/Loader';

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
    ...(thinScreen ? { maxHeight: '160px' } : null),
    boxShadow: theme.shadows.base,
  }),
  closeList: {
    position: 'absolute',
    right: '4px',
    top: '8px',
    padding: '4px',
  },
  noResults: {
    ...listElemStyle,
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
  },
  listElem: {
    ...listElemStyle,
    cursor: 'pointer',
    display: 'block',
    fontWeight: theme.fontWeights.normal,
    ':hover': {
      background: theme.colors.gray[50],
    },
    ':focus-visible': {
      outline: 'none',
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
    '*': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },
  searchDropdownWrapper: (center) => ({
    maxWidth: theme.breakpoints.md,
    flexGrow: 1,
    ...(center ? { margin: '0 auto' } : null),
  }),
};

function DropdownList({
  items,
  onItemClick,
  setIsShown,
  isShown,
  position,
  width,
}) {
  const { T } = useContext(TranslationsContext);
  const { thinScreen } = useContext(WindowContext);

  let listItems = <Box sx={style.noResults}>{T('no results')}</Box>;

  if (items.length > 0) {
    listItems = items.map(({ label, value, ...restItem }, i) => (
      <Box
        aria-roledescription="dropdown-item"
        sx={style.listElem}
        tabIndex={0}
        onBlur={() => i === items.length - 1 && setIsShown(false)}
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
        ));
  }
  return (
    <Box
      sx={{
        ...style.list(isShown, thinScreen),
        ...theme.styles.global.contextMenuLikeChild(position, width),
      }}
    >
      {listItems}

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
  width: '250px',
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

const SearchDropdownWrapper = forwardRef(({ sx, children }, ref) => (
  <Box
    sx={{
      ...theme.styles.global.contextMenuLikeWrapper,
      ...sx,
    }}
    ref={ref}
  >
    {children}
  </Box>
));

SearchDropdownWrapper.defaultProps = {
  sx: null,
};
SearchDropdownWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
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
  showWithOverlay,
}) {
  const wrapperRef = useRef();
  const inputRef = useRef();
  const [isShown, setIsShown] = useState(false);
  const [items, setItems] = useState([]);
  const delayedCall = useDelayedAction();
  let [inputVal, inputValSetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (inputValFromProps !== null && inputValSetterFromProps !== null) {
    inputVal = inputValFromProps;
    inputValSetter = inputValSetterFromProps;
  }

  const searchCall = searchHook((results) => {
    setIsLoading(false);
    if (inputVal === '') {
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
    setItems((prevItems) => {
      if (prevItems.length > 0) {
        return prevItems;
      }
      if (initialItems?.length) {
        return initialItems;
      }
      return [];
    });
    setIsShown(!!items);
  }, [items]);

  const resetDropdown = useCallback(() => {
    setItems(initialItems || []);
    onValueEmpty();
  }, [initialItems, onValueEmpty]);

  const onInputChange = useCallback(
    (e) => {
      const v = e.target.value;
      if (v === '') {
        resetDropdown();
      } else {
        setIsLoading(true);
        delayedCall(searchCall, v);
      }
      inputValSetter(v);
    },
    [initialItems],
  );

  const inputIcon = useMemo(() => {
    if (isLoading) {
      return <Loader isLoading={isLoading} mini />;
    }
    if (inputVal !== '' && showCloseIcon) {
      return (
        <SmallCloseIcon
          tabIndex={9999}
          aria-roledescription="clear-input"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            inputValSetter('');
            resetDropdown();
            inputRef.current.focus();
          }}
        />
      );
    }
    return icon;
  }, [showLoader, icon, onValueEmpty, inputVal, showCloseIcon, isLoading]);

  useEffect(() => {
    if (isShown && showWithOverlay && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isShown, inputRef.current]);

  useEffect(() => {
    setItems(initialItems || []);
  }, [initialItems]);

  const inputGroup = (
    <InputGroup sx={!isShown && showWithOverlay ? sx : null}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        onChange={onInputChange}
        onFocus={onInputFocus}
        value={inputVal}
        onBlur={(e) => {
          if (
            e.relatedTarget?.ariaRoleDescription !== 'dropdown-item' &&
            e.relatedTarget?.ariaRoleDescription !== 'clear-input'
          ) {
            setIsShown(false);
          }
        }}
      />

      <InputRightElement>{inputIcon}</InputRightElement>
    </InputGroup>
  );

  const dropdownList = (
    (inputVal !== '' || !!initialItems) && !isLoading ? <DropdownList
      items={items}
      onItemClick={onItemClick}
      setIsShown={setIsShown}
      isShown={isShown}
      position={position}
      width={dropdownWidth}
    /> : null
  );

  if (showWithOverlay) {
    if (isShown) {
      return (
        <Overlay isShown={isShown} isShownSetter={setIsShown}>
          <SearchDropdownWrapper
            sx={{
              ...style.searchDropdownWrapper(isShown && showWithOverlay),
              ...sx,
            }}
            ref={wrapperRef}
          >
            <>
              {inputGroup}
              {dropdownList}
            </>
          </SearchDropdownWrapper>
        </Overlay>
      );
    }
    return inputGroup;
  }
  return (
    <SearchDropdownWrapper sx={sx} ref={wrapperRef}>
      <>
        {inputGroup}
        {dropdownList}
      </>
    </SearchDropdownWrapper>
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
  dropdownWidth: '250px',
  onValueEmpty: () => {},
  sx: null,
  showWithOverlay: false,
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
  showWithOverlay: PropTypes.bool,
};

export { Dropdown, SearchDropdown };
