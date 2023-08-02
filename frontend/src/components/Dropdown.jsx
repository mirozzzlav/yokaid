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
import { SearchIcon } from '@chakra-ui/icons';
import { theme } from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import { LoaderContext } from 'src/providers/LoaderProvider';

const style = {
  dropdownContainer: {
    position: 'relative',
  },
  list: {
    marginTop: '5px',
    position: 'absolute',
    background: '#fff',
    padding: '1rem 0',
    borderRadius: theme.radii.md,
    boxShadow: theme.shadows.md,
    maxWidth: '400px',
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

function useDropdownItemClick(
  wrapperRef,
  items,
  isShown,
  setIsShown,
  onItemClick = null,
) {
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsShown(false),
  });

  return useMemo(() => {
    if (!items) {
      return null;
    }
    return items.map((item) => ({
      ...item,
      onClick: (value) => {
        if (item.onClick) {
          item.onClick(value);
        }
        if (onItemClick) {
          onItemClick(value);
        }
        setIsShown(false);
      },
    }));
  }, [items, onItemClick]);
}

function useDropdownPosition(dropdownRef, wrapperRef, isShown, positionSetup) {
  const [position, setPositionRaw] = useState(0);

  if (positionSetup === 'left') {
    return 0;
  }

  const setPosition = useCallback(() => {
    if (!dropdownRef.current || !wrapperRef.current) {
      setPositionRaw(0);
    }

    const diff =
      wrapperRef.current.offsetWidth - dropdownRef.current.offsetWidth;
    setPositionRaw(positionSetup === 'center' ? Math.round(diff / 2) : diff);
  }, [dropdownRef.current, wrapperRef.current, isShown]);

  useEffect(() => {
    window.addEventListener('resize', setPosition);
    return () => window.removeEventListener('resize', setPosition);
  }, [setPosition, positionSetup]);

  useEffect(setPosition, [isShown]);

  return position;
}

function Dropdown({ items: itemsRaw, buttonMeta, positionSetup }) {
  const wrapperRef = useRef();
  const dropdownRef = useRef();
  const [isShown, setIsShown] = useState(false);
  const items = useDropdownItemClick(wrapperRef, itemsRaw, isShown, setIsShown);

  const position = useDropdownPosition(
    dropdownRef,
    wrapperRef,
    isShown,
    positionSetup,
  );

  return (
    <Box ref={wrapperRef} sx={style.dropdownContainer}>
      <Button
        onClick={() => setIsShown((prevShown) => !prevShown)}
        variant={buttonMeta.variant}
        sx={buttonMeta.style}
      >
        {buttonMeta.content}
      </Button>

      {items ? (
        <DropdownList
          items={items}
          ref={dropdownRef}
          position={position}
          isShown={isShown}
        />
      ) : null}
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

const DropdownList = forwardRef(({ items, isShown, position }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        ...style.list,
        left: position,
        overflow: 'hidden',
        ...(!isShown ? { display: 'none' } : null),
      }}
    >
      {items.length === 0 ? (
        <Box sx={style.listElem}>no results</Box>
      ) : (
        <>
          {items.map(({ label: itemLabel, value: itemValue, id, onClick }) => (
            <Button
              sx={style.listElem}
              variant="ghost"
              key={`${id}`}
              onClick={() => onClick(itemValue)}
            >
              {`${itemLabel}`}
            </Button>
          ))}
        </>
      )}
    </Box>
  );
});

DropdownList.defaultProps = {
  items: null,
};
DropdownList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
      ]),
      onClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
    }),
  ),
  isShown: PropTypes.bool.isRequired,
  position: PropTypes.number.isRequired,
};

function SearchDropdown({
  placeholder,
  searchHook,
  icon,
  onItemClick,
  positionSetup,
  showLoader,
}) {
  const valueRef = useRef('');
  const [isShown, setIsShown] = useState(false);
  const { searchCall, searchResults } = searchHook(() => setIsShown(true));
  const { isLoading } = useContext(LoaderContext);
  const wrapperRef = useRef();
  const dropdownRef = useRef(0);
  const position = useDropdownPosition(
    dropdownRef,
    wrapperRef,
    isShown,
    positionSetup,
  );

  const onInputChange = useCallback((v) => {
    valueRef.current = v;
    if (valueRef.current.length < 3) {
      setIsShown(false);
      return;
    }
    searchCall(valueRef.current);
  }, []);

  const items = useDropdownItemClick(
    wrapperRef,
    searchResults,
    isShown,
    setIsShown,
    onItemClick,
  );

  return (
    <Box sx={style.dropdownContainer} ref={wrapperRef}>
      <InputGroup>
        <Input
          placeholder={placeholder}
          onChange={(e) => onInputChange(e.target.value)}
        />
        {showLoader && (
          <InputRightElement>
            {isLoading ? <Spinner /> : icon}
          </InputRightElement>
        )}
      </InputGroup>
      {items ? (
        <DropdownList
          position={position}
          items={items}
          isShown={isShown}
          ref={dropdownRef}
        />
      ) : null}
    </Box>
  );
}

SearchDropdown.defaultProps = {
  placeholder: 'search something',
  icon: <SearchIcon />,
  positionSetup: 'right',
  showLoader: false,
};
SearchDropdown.propTypes = {
  placeholder: PropTypes.string,
  searchHook: PropTypes.func.isRequired,
  icon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
  positionSetup: PropTypes.string,
  showLoader: PropTypes.bool,
};

export { Dropdown, SearchDropdown };
