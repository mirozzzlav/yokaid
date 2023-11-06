import { useCallback, useContext, useMemo } from 'react';
import { InitialDataContext } from 'src/providers/InitialDataProvider';
import { TranslationsContext } from 'src/providers/TranslationsProvider';

export default function useValidationErrors() {
  const { T } = useContext(TranslationsContext);
  const { inputFormats } = useContext(InitialDataContext);
  const getValidationError = useCallback(
    (validationError) => {
      const unknownError = T('unknown error');
      if (!validationError) {
        return unknownError;
      }
      const { validator, field, format, param } = validationError;
      return (
        {
          min: T('validation min'),
          max: T('validation max'),
          required: T('validation required'),
          email: T('validation email'),
          multiWords: T('validation multiWords'),
          requiredWithout: T('validation requiredWithout', [field, param]),
          phone: T('validation phone', [format]),
        }[validator] || unknownError
      );
    },
    [T],
  );

  return useMemo(
    () => ({
      getValidationError,
      getValidationErrors: (errors) =>
        Object.fromEntries(
          errors.map((error) => [
            error.field,
            getValidationError({
              ...error,
              format: inputFormats?.[error.validator],
            }),
          ]),
        ),
    }),

    [inputFormats, getValidationError],
  );
}
