import { useCallback, useContext, useEffect, useState } from 'react';
import { InitialDataContext, UserIdContext } from 'src/providers';
import config from 'src/config';
import { getValidationError } from 'src/helpers';

function mapValidationErrors(errors, formats) {
  return Object.fromEntries(
    errors.map((error) => [
      error.field,
      getValidationError({ ...error, format: formats[error.validator] }),
    ]),
  );
}

const requestStatesConsts = {
  initial: 'initial',
  loading: 'loading',
  error: 'error',
  success: 'success',
};

const getDefaultFormState = () => ({
  formResult: {
    msg: '',
    data: null,
  },
  inputsErrors: null,
  inputs: null,
});

export default function useForms(formConfigs) {
  const { validationRules, inputFormats } = useContext(InitialDataContext);
  const { userId, saveUserId } = useContext(UserIdContext);
  const [formStates, setFormStates] = useState(
    Object.fromEntries(
      Object.keys(formConfigs).map((formId) => [formId, getDefaultFormState()]),
    ),
  );

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
      setformResult: (formResult) => updateFormState(formId, { formResult }),
      setInputsErrors: (inputsErrors) =>
        updateFormState(formId, { inputsErrors }),
      resetForm: () => {
        updateFormState(formId, {
          inputsErrors: null,
          inputs: null,
        });
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
      getInput: (name, split = false) => {
        if (!formStates[formId].inputs?.[name]) {
          return '';
        }
        if (split) {
          return formStates[formId].inputs[name].split(',');
        }
        return formStates[formId].inputs[name];
      },
      updateInput: (name, val, concat = false) => {
        let isAdded = true;
        const valStr = `${val}`;
        setFormStates((prevData) => {
          if (
            prevData[formId].inputs?.[name] &&
            prevData[formId].inputs[name].includes(valStr) &&
            concat
          ) {
            // on concat mode "val1,val2,val3" we dont want to value includes some
            // value that is already in for example val1
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
                  prevData[formId].inputs?.[name] && concat
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
      const { resetForm, setInputsErrors, setformResult } =
        getFormStateAndHelpers(formId);
      return [
        formId,
        formConfig.hook((response, success) => {
          setformResult(response);
          if (!success) {
            setRequestState(formId, requestStatesConsts.error);
            if (response.data) {
              setInputsErrors(mapValidationErrors(response.data, inputFormats));
            }
            return;
          }
          saveUserId();
          resetForm();
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
            [config.userIdMeta.name]: userId,
          });
        }
      }),
    [formConfigs, requestStates, userId],
  );

  return getFormStateAndHelpers;
}
