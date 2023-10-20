import { useCallback, useContext, useEffect, useState } from 'react';
import { InitialDataContext, UserIdContext } from 'src/providers';

function mapValidationErrors(errors, formats) {
  const messages = {
    min: (field) => `${field} is too short or haven't reach min limit`,
    max: (field) => `${field} is too long or above the limit`,
    required: (field) => `${field} is empty`,
    email: () => 'fix the email',
    multiWords: (field) =>
      formats[field]
        ? `ensure the ${field} match the format: ${formats[field]}`
        : `${field} has to have at least 2 words`,
    requiredWithout: (field, withoutField) =>
      `${field} or ${withoutField} have to be filled in`,
    phone: () => `ensure the phone match the format: ${formats?.phone}`,
  };

  return Object.fromEntries(
    errors.map(({ field, validator, param }) => [
      field,
      (messages[validator] && messages[validator](field, param)) ||
        'Unknown error',
    ]),
  );
}

const requestStatesConsts = {
  initial: 'initial',
  loading: 'loading',
  error: 'error',
  success: 'success',
};

const getDefaultFormState = (inputNames) => ({
  errorMsg: '',
  successData: null,
  inputsErrors: null,
  inputs: Object.fromEntries(inputNames.map((inputName) => [inputName, ''])),
});

export default function useForms(formConfigs) {
  const { validationRules, inputFormats } = useContext(InitialDataContext);
  const { userId, saveUserId, userIdName } = useContext(UserIdContext);

  const getDefaultFormStates = useCallback(
    () =>
      Object.fromEntries(
        Object.keys(formConfigs).map((formId) => [
          formId,
          getDefaultFormState(formConfigs[formId].inputNames),
        ]),
      ),
    [formConfigs],
  );

  const [formStates, setFormStates] = useState(getDefaultFormStates());

  const [requestStates, setRequestStates] = useState(
    (() =>
      Object.fromEntries(
        Object.keys(formConfigs).map((formId) => [
          formId,
          requestStatesConsts.initial,
        ]),
      ))(),
  );

  const updateFormState = useCallback(
    (formId, stateIncrement) =>
      setFormStates((prevFormStates) => ({
        ...prevFormStates,
        [formId]: {
          ...prevFormStates[formId],
          ...stateIncrement,
        },
      })),
    [],
  );

  const setRequestState = useCallback(
    (formId, state) =>
      setRequestStates((prevState) => ({
        ...prevState,
        [formId]: state,
      })),
    [],
  );

  const getFormStateAndHelpers = useCallback(
    (formId) => ({
      setErrorMsg: (errorMsg) => updateFormState(formId, { errorMsg }),
      setSuccessData: (data) => updateFormState(formId, { successData: data }),
      setInputsErrors: (inputsErrors) =>
        updateFormState(formId, { inputsErrors }),
      resetForm: () => {
        updateFormState(
          formId,
          getDefaultFormState(formConfigs[formId].inputNames),
        );
        setRequestState(formId, requestStatesConsts.initial);
      },
      validationRules: (() => {
        if (!formConfigs[formId]?.validationGroup || !validationRules) {
          return null;
        }
        return validationRules[formConfigs[formId]?.validationGroup];
      })(),

      ...formStates[formId],

      submitForm: () => setRequestState(formId, requestStatesConsts.loading),
      formRequestState: {
        isError: requestStates[formId] === requestStatesConsts.error,
        isLoading: requestStates[formId] === requestStatesConsts.loading,
        isSuccess: requestStates[formId] === requestStatesConsts.success,
        isFinished:
          requestStates[formId] === requestStatesConsts.error ||
          requestStates[formId] === requestStatesConsts.success,
      },

      updateInputs: (name, val, concat = false) => {
        let isAdded = true;
        const valStr = `${val}`;
        setFormStates((prevData) => {
          if (
            prevData[formId]?.inputs[name] &&
            prevData[formId].inputs[name].includes(valStr) &&
            concat
          ) {
            isAdded = false;
            return prevData;
          }
          return {
            ...prevData,
            [formId]: {
              ...prevData[formId],
              inputs: {
                ...prevData[formId].inputs,
                [name]:
                  prevData[formId].inputs[name] && concat
                    ? `${prevData[formId].inputs[name]},${valStr}`
                    : valStr,
              },
            },
          };
        });

        return isAdded;
      },
    }),
    [formStates, requestStates, formConfigs, validationRules],
  );

  const calls = Object.fromEntries(
    Object.entries(formConfigs).map(([formId, formConfig]) => {
      const { resetForm, setInputsErrors, setErrorMsg, setSuccessData } =
        getFormStateAndHelpers(formId);
      return [
        formId,
        formConfig.hook((response) => {
          setInputsErrors(null);
          setSuccessData(null);
          if (response.error) {
            setRequestState(formId, requestStatesConsts.error);
            setErrorMsg(response.error.msg || 'Form request failed');
            if (response.error.extraData) {
              setInputsErrors(
                mapValidationErrors(response.error.extraData, inputFormats),
              );
            }
            return;
          }

          saveUserId();
          resetForm();
          if (typeof response.data === 'string') {
            setSuccessData({ msg: response.data });
          } else {
            setSuccessData(response.data);
          }

          setRequestState(formId, requestStatesConsts.success);
        }),
      ];
    }),
  );

  useEffect(
    () =>
      Object.keys(formConfigs).forEach((formId) => {
        const { inputs: inputsRaw } = getFormStateAndHelpers(formId);
        const inputsToRequestMapper =
          formConfigs[formId]?.inputsToRequestMapper;

        if (requestStates[formId] === requestStatesConsts.loading) {
          calls[formId]({
            ...(inputsToRequestMapper
              ? inputsToRequestMapper(inputsRaw)
              : inputsRaw),
            [userIdName]: userId,
          });
        }
      }),
    [formConfigs, requestStates, userId],
  );

  return getFormStateAndHelpers;
}
