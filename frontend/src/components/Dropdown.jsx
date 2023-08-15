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
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { SearchIcon } from '@chakra-ui/icons';
import { theme } from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import { LoaderContext } from 'src/providers';
import { useDelayedAction } from 'src/hooks';

const style = {
  dropdownContainer: {
    position: 'relative',
  },
  list: (isShown, positionSetup) => {
    let position = { left: 0 };
    if (positionSetup === 'center') {
      position = { left: 'calc(50% - 300px/2)' };
    }
    if (positionSetup === 'right') {
      position = { right: 0 };
    }
    return {
      marginTop: '5px',
      position: 'absolute',
      background: '#fff',
      padding: '1rem 0',
      borderRadius: theme.radii.md,
      boxShadow: theme.shadows.md,
      width: '300px',
      ...position,
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
  positionSetup,
}) {
  return (
    <Box
      sx={{
        ...style.list(isShown, positionSetup),
      }}
    >
      {items.length === 0 ? (
        <Box sx={style.listElem}>no results</Box>
      ) : (
        <Box>
          {items.map(({ label, value, id, ...restItem }) => (
            <Button
              sx={style.listElem}
              variant="ghost"
              key={`${id}`}
              onClick={() => {
                if (restItem?.onClick) {
                  restItem.onClick(value);
                } else if (onItemClick) {
                  onItemClick(value);
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
      PropTypes.object,
      PropTypes.array,
    ]),
    onClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  }),
);

DropdownList.defaultProps = {
  onItemClick: null,
};
DropdownList.propTypes = {
  items: itemsPropType.isRequired,
  onItemClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  setIsShown: PropTypes.func.isRequired,
  positionSetup: PropTypes.string.isRequired,
  isShown: PropTypes.bool.isRequired,
};

function Dropdown({ items, buttonMeta, positionSetup }) {
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
        positionSetup={positionSetup}
        isShown={isShown}
      />
    </Box>
  );
}

Dropdown.defaultProps = {
  items: null,
  positionSetup: 'right',
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
  positionSetup: PropTypes.string,
};

function SearchDropdown({
  placeholder,
  searchHook,
  initialItems,
  icon,
  onItemClick,
  positionSetup,
  showLoader,
}) {
  const valueRef = useRef('');
  const { isLoading } = useContext(LoaderContext);
  const wrapperRef = useRef();
  const [isShown, setIsShown] = useState(false);
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });
  const [items, setItems] = useState(initialItems || []);
  const delayedCall = useDelayedAction();

  const searchCall = searchHook((responseMapItems) => {
    setItems(responseMapItems);
    setIsShown(true);
  });

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
    (v) => {
      valueRef.current = v;
      if (valueRef.current.length === 0) {
        setItems(initialItems || []);
        setIsShown(!!initialItems);
      } else {
        setIsShown(false);
        delayedCall(searchCall, valueRef.current);
      }
    },
    [initialItems, valueRef],
  );

  return (
    <Box sx={style.dropdownContainer} ref={wrapperRef}>
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={onInputFocus}
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
        positionSetup={positionSetup}
      />
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: 'search something',
  icon: <SearchIcon />,
  positionSetup: 'right',
  showLoader: false,
  initialItems: null,
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchHook: PropTypes.func.isRequired,
  initialItems: PropTypes.oneOfType([itemsPropType, PropTypes.oneOf([null])]),
  icon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
  positionSetup: PropTypes.string,
  showLoader: PropTypes.bool,
};

export { Dropdown, SearchDropdown };
