import { useCallback, useEffect, useState } from 'react';

function mapValidationErrors(errors) {
  const messages = {
    min: 'value is empty or not long enough',
    required: 'value is empty',
    email: 'email has wrong format',
  };

  return Object.fromEntries(
    errors.map(({ field, validator }) => [
      `${field.substring(0, 1).toLowerCase()}${field.substring(1)}`,
      messages[validator] || 'Unknown error',
    ]),
  );
}

export default function useForm(
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
  callHook,
  fieldNames,
  closeOnFinish = true,
) {
  const [error, setError] = useState(null);
  const [inputsErrors, setInputsErrors] = useState(null);

  const call = callHook(
    useCallback((response) => {
      setInputsErrors([]);
      setError('');

      if (response.error) {
        setError(response.error.msg || 'Login failed');
        if (response.error.extra_data) {
          setInputsErrors(mapValidationErrors(response.error.extra_data));
        }
        return;
      }

      if (closeOnFinish) {
        setIsShown(false);
      }
    }, []),
  );

  const [inputs, setInputs] = useState(
    (() => ({
      ...Object.fromEntries(fieldNames.map((fN) => [fN, ''])),
    }))(),
  );
  const updateInputs = useCallback((name, val) => {
    setError(null);
    setInputsErrors([]);
    setIsSubmitted(false);
    setInputs((prevData) => ({ ...prevData, [name]: val }));
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      call(inputs);
    }
  }, [isSubmitted, inputs]);

  useEffect(() => {
    if (isShown) {
      setError(null);
      setInputsErrors(null);
      setIsSubmitted(false);
    }
  }, [isShown]);

  return {
    error,
    inputsErrors,
    inputs,
    updateInputs,
  };
}
