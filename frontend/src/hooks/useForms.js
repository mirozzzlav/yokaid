import { useCallback, useContext, useEffect, useState } from 'react';
import { InitialDataContext } from 'src/providers';

function mapValidationErrors(errors) {
  const messages = {
    min: (field) => `${field} is too short or haven't reach min limit`,
    required: (field) => `${field} is empty`,
    email: () => 'email has wrong format',
    multiWords: (field) => `${field} has to have at least 2 words`,
    requiredWithout: (field, withoutField) =>
      `${field} or ${withoutField} have to be filled in`,
    phone: () => 'phone is in wrong format, no spaces allowed',
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
  inputsErrors: null,
  inputs: Object.fromEntries(inputNames.map((inputName) => [inputName, ''])),
});

export default function useForms(formConfigs) {
  const { validationRules } = useContext(InitialDataContext);
  const [formStates, setFormStates] = useState(
    Object.fromEntries(
      Object.entries(formConfigs).map(([id, { inputNames }]) => [
        id,
        getDefaultFormState(inputNames),
      ]),
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
      setErrorMsg: (errorMsg) => updateFormState(formId, { errorMsg }),

      setRequestState: (requestState) => setRequestState(formId, requestState),
      setInputs: (inputs) => updateFormState(formId, { inputs }),
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
        if (!formConfigs[formId]?.validationRulesNames || !validationRules) {
          return null;
        }
        let resRules = {};
        formConfigs[formId]?.validationRulesNames.forEach((ruleName) => {
          resRules = { ...resRules, ...validationRules[ruleName] };
        });
        return resRules;
      })(),

      ...formStates[formId],

      submitForm: () => setRequestState(formId, requestStatesConsts.loading),
      formRequestState: {
        isError: requestStates[formId] === requestStatesConsts.error,
        isSuccess: requestStates[formId] === requestStatesConsts.success,
        isFinished:
          requestStates[formId] === requestStatesConsts.error ||
          requestStates[formId] === requestStatesConsts.success,
      },

      updateInputs: (name, val, concat = false) => {
        let isAdded = true;
        const valStr = `${val}`;

        setFormStates((prevData) => {
          if (prevData[formId]?.inputs[name].includes(valStr) && concat) {
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
      const { resetForm, setInputsErrors, setErrorMsg } =
        getFormStateAndHelpers(formId);
      return [
        formId,
        formConfig.hook((response) => {
          setInputsErrors(null);
          if (response.error) {
            setRequestState(formId, requestStatesConsts.error);
            setErrorMsg(response.error.msg || 'Form request failed');
            if (response.error.extraData) {
              setInputsErrors(mapValidationErrors(response.error.extraData));
            }
            return;
          }

          resetForm();
          setRequestState(formId, requestStatesConsts.success);
        }),
      ];
    }),
  );

  useEffect(
    () =>
      Object.keys(formConfigs).forEach((formId) => {
        const { inputs } = getFormStateAndHelpers(formId);
        const inputsToRequestMapper =
          formConfigs[formId]?.inputsToRequestMapper;
        if (requestStates[formId] === requestStatesConsts.loading) {
          calls[formId](
            inputsToRequestMapper ? inputsToRequestMapper(inputs) : inputs,
          );
        }
      }),
    [formConfigs, requestStates],
  );

  return getFormStateAndHelpers;
}
