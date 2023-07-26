import { useCallback, useEffect, useState } from 'react';

function mapValidationErrors(errors) {
  const messages = {
    min: 'value is empty or not long enough',
    required: 'value is empty',
    email: 'email has wrong format',
    multiWords: 'fill in at least 2 words',
  };

  return Object.fromEntries(
    errors.map(({ field, validator }) => [
      `${field.substring(0, 1).toLowerCase()}${field.substring(1)}`,
      messages[validator] || 'Unknown error',
    ]),
  );
}

const formStates = {
  initial: 'initial',
  error: 'error',
  success: 'success',
};
export default function useForm(
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
  useCallHook,
  fieldNames,
  closeOnSuccess = true,
) {
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState(formStates.initial);

  const [inputsErrors, setInputsErrors] = useState(null);
  const [inputs, setInputs] = useState(
    (() => ({
      ...Object.fromEntries(fieldNames.map((fN) => [fN, ''])),
    }))(),
  );

  const resetInputs = useCallback(() => {
    setInputs((prevData) =>
      Object.fromEntries(Object.entries(prevData).map(([k]) => [k, ''])),
    );
  }, []);

  const updateInputs = useCallback((name, val) => {
    setInputs((prevData) => ({ ...prevData, [name]: val }));
  }, []);

  const call = useCallHook(
    useCallback((response) => {
      if (response.error) {
        setState(formStates.error);
        setErrorMsg(response.error.msg || 'Login failed');
        if (response.error.extra_data) {
          setInputsErrors(mapValidationErrors(response.error.extra_data));
        }
        return;
      }

      setState(formStates.success);
      resetInputs();
      if (closeOnSuccess) {
        setIsShown(false);
      }
    }, []),
  );

  useEffect(() => {
    if (isSubmitted) {
      call(inputs);
      setErrorMsg('');
      setState(formStates.initial);
      setInputsErrors(null);
      setIsSubmitted(false);
    }
  }, [isSubmitted, inputs]);

  return {
    errorMsg,
    inputsErrors,
    inputs,
    updateInputs,
    isError: () => state === formStates.error,
    isSuccess: () => state === formStates.success,
  };
}
