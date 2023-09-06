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
import { SearchIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { theme, globalStyle } from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import { useDelayedAction } from 'src/hooks';
import { LoaderContext } from 'src/providers';

const style = {
  list: (isShown) => ({
    background: '#fff',
    padding: '1rem 0',
    borderRadius: theme.radii.md,
    boxShadow: theme.shadows.md,
    overflow: 'hidden',
    ...(!isShown ? { display: 'none' } : null),
  }),
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
        ...style.list(isShown),
        ...globalStyle.contextMenuLikeChild(position, width),
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
    <Box ref={wrapperRef} sx={globalStyle.contextMenuLikeWrapper}>
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
  inputVal: inputValFromProps,
  onInputValChange,
  icon,
  onValueSet,
  onValueEmpty,
  position,
  showLoader,
  width,
}) {
  const [inputVal, setInputVal] = useState(inputValFromProps);
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
      onValueSet(onClickData);
      setInputVal(onClickData.label);
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
      setInputVal(v);
      if (v === '') {
        resetDropdown();
      } else {
        onInputValChange(v);
        delayedCall(searchCall, v);
      }
    },
    [initialItems],
  );

  const inputIcon = useMemo(() => {
    if (showLoader && isLoading) {
      return <Spinner />;
    }
    if (inputVal === '') {
      return icon;
    }
    return (
      <SmallCloseIcon
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          setInputVal('');
          onValueEmpty();
        }}
      />
    );
  }, [showLoader, isLoading, icon, onValueEmpty]);

  useEffect(() => setInputVal(inputValFromProps), [inputValFromProps]);

  return (
    <Box sx={globalStyle.contextMenuLikeWrapper} ref={wrapperRef}>
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={onInputFocus}
          value={inputVal}
        />

        <InputRightElement>{inputIcon}</InputRightElement>
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
  placeholder: '',
  icon: <SearchIcon />,
  position: 'right',
  showLoader: false,
  initialItems: null,
  inputVal: '',
  onInputValChange: () => {},
  width: '300px',
  onValueEmpty: () => {},
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchHook: PropTypes.func.isRequired,
  initialItems: PropTypes.oneOfType([itemsPropType, PropTypes.oneOf([null])]),
  inputVal: PropTypes.string,
  onInputValChange: PropTypes.func,
  icon: PropTypes.node,
  onValueSet: PropTypes.func.isRequired,
  onValueEmpty: PropTypes.func,
  position: PropTypes.string,
  showLoader: PropTypes.bool,
  width: PropTypes.string,
};

export { Dropdown, SearchDropdown };
