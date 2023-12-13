import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, FormControl, FormErrorMessage, FormLabel, Input, InputGroup } from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { unknownObjectValidator } from 'src/helpers';
import {
  TranslationsContext,
} from 'src/providers';

export function VerifyBySmsForm({
  formResult,
  state,
  inputsErrors,
  getInput,
  updateInput,
}) {
  const { T } = useContext(TranslationsContext);

  return (
    <Box>

      <FormControl>
        <InfoMessage message={T('sms verification form info')} />
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.code}
        isRequired
      >
        <FormLabel>{T('sms code')}</FormLabel>
        <InputGroup>
          <Input
            type="text"
            value={getInput('code')}
            onChange={(e) => {
                updateInput('code', e.target.value);
              }}
          />
        </InputGroup>
        <FormErrorMessage>{inputsErrors?.code}</FormErrorMessage>
      </FormControl>

      {state.isError ? <ErrorMessage message={T(formResult.msg)} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={T('form sms verification success')}
        />
      ) : null}
    </Box>
  );
}
VerifyBySmsForm.defaultProps = {
  formResult: null,
};

VerifyBySmsForm.prototype.propTypes = {
  formResult: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  getInput: PropTypes.func.isRequired,
  updateInput: PropTypes.func.isRequired,
};

export function formConfigFactory(entity) {
  return {
    hook: (onCallFinish) => {
      const { callPost } = useCall(onCallFinish);

      return (inputs) =>
        callPost(config.api.endPointsURLs.makePayment, inputs);
    },
    formUI: VerifyBySmsForm,
  };
}
