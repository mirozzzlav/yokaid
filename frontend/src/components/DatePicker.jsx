import React, { useCallback, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.min.css';
import DatePickerFromLib from 'react-datepicker';
import {
  Box,
  Button,
  InputGroup,
  InputRightElement,
  useOutsideClick,
} from '@chakra-ui/react';
import { SearchIcon, SmallCloseIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { css } from '@emotion/css';
import { toLocalDate } from 'src/helpers';
import theme from 'src/style';

const style = {
  button: {
    cursor: 'text',
    fontWeight: 400,
    display: 'flex',
    width: '100%',
    gap: '0.5rem',
    justifyContent: 'left',
    ':hover': {
      background: 'none',
    },
  },
  placeholder: {
    color: theme.colors.blackAlpha[500],
  },
  divider: {
    '::after': {
      content: '"|"',
    },
    color: theme.colors.blackAlpha[500],
  },
};

export default function DatePicker({
  icon,
  placeholder,
  onValueSet,
  onValueEmpty,
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const onChange = ([start, end]) => {
    setStartDate(start);
    setEndDate(end);
    onValueSet(start, end || null);
  };
  const [isPickerShown, setIsPickerShown] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsPickerShown(false),
  });

  const resetPicker = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    onValueEmpty();
  }, []);

  return (
    <Box sx={theme.styles.global.contextMenuLikeWrapper} ref={wrapperRef}>
      {isPickerShown && (
        <Box sx={theme.styles.global.contextMenuLikeChild('left', '242px')}>
          <DatePickerFromLib
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </Box>
      )}
      <InputGroup>
        <Button
          variant="outline"
          onClick={() => setIsPickerShown(true)}
          sx={style.button}
        >
          {startDate ? (
            <span>{toLocalDate(startDate)}</span>
          ) : (
            <span className={css(style.placeholder)}>{placeholder}</span>
          )}
          {endDate ? (
            <>
              <span className={css(style.divider)} />
              <span>{toLocalDate(endDate)}</span>
            </>
          ) : null}
        </Button>
        <InputRightElement>
          {startDate || endDate ? (
            <SmallCloseIcon onClick={resetPicker} sx={{ cursor: 'pointer' }} />
          ) : (
            icon
          )}
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}

DatePicker.defaultProps = {
  icon: <SearchIcon />,
  placeholder: '',
  onValueEmpty: () => {},
};
DatePicker.prototype.propTypes = {
  icon: PropTypes.node,
  placeholder: PropTypes.string,
  onValueSet: PropTypes.func.isRequired,
  onValueEmpty: PropTypes.func,
};
