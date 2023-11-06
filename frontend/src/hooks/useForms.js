import { useCallback, useContext, useEffect, useState } from 'react';
import { InitialDataContext, UserIdContext } from 'src/providers';
import config from 'src/config';
import useValidationErrors from 'src/hooks/useValidationErrors';

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
  inputs: null,
});

export default function useForms(formConfigs) {
  const { validationRules } = useContext(InitialDataContext);
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
  const { getValidationErrors } = useValidationErrors();

  const getFormStateAndHelpers = useCallback(
    (formId) => ({
      setFormResult: (formResult) => updateFormState(formId, { formResult }),
      resetForm: () => {
        updateFormState(formId, {
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
      inputsErrors:
        requestStates[formId] === requestStatesConsts.error &&
        formStates[formId].formResult.data
          ? getValidationErrors(formStates[formId].formResult.data)
          : null,
    }),
    [formStates, requestStates, formConfigs, validationRules],
  );

  const calls = Object.fromEntries(
    Object.entries(formConfigs).map(([formId, formConfig]) => {
      const { resetForm, setFormResult } = getFormStateAndHelpers(formId);
      return [
        formId,
        formConfig.hook((response, success) => {
          setFormResult(response);
          if (!success) {
            setRequestState(formId, requestStatesConsts.error);
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
