import React, { useEffect, useRef, useState } from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useLocalStorage } from 'src/hooks';
import { unknownObjectValidator } from 'src/helpers';
import PropTypes from 'prop-types';

export default function LocalDataFormControl({
  value,
  valueSetter,
  label,
  placeholder,
  isRequired,
  error,
  formState,
}) {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();
  const valueCopyRef = useRef('');
  useEffect(() => {
    const localDataInputVal = getLocalDataValue('localDataInputs', label);
    if (localDataInputVal) {
      valueSetter(localDataInputVal);
    }
  }, []);

  useEffect(() => {
    if (formState.isLoading) {
      valueCopyRef.current = value;
    }
    if (formState.isSuccess) {
      setLocalDataValue('localDataInputs', label, valueCopyRef.current);
    }
  }, [formState.isLoading, formState.isSuccess, value]);

  return (
    <FormControl isInvalid={error}>
      <FormLabel>{label}</FormLabel>
      <Input
        isRequired={isRequired}
        value={value}
        onChange={(e) => valueSetter(e.target.value)}
        placeholder={placeholder}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

LocalDataFormControl.defaultProps = {
  placeholder: '',
  error: null,
};

LocalDataFormControl.prototype.propTypes = {
  value: PropTypes.string.isRequired,
  valueSetter: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  formState: unknownObjectValidator.isRequired,
};
