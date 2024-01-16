import React, { useContext } from 'react';
import { TranslationsContext } from 'src/providers';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  Textarea,
} from '@chakra-ui/react';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import PropTypes from 'prop-types';
import config from 'src/config';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import { useCall } from 'src/hooks';

function ContactForm({
  formResult,
  state,
  inputsErrors,
  getInput,
  updateInput,
  validationRules,
}) {
  const { T } = useContext(TranslationsContext);

  return (
    <Box>
      <FormControl
        isInvalid={inputsErrors?.from}
        isRequired={isFieldRequired(validationRules?.from)}
      >
        <FormLabel>{T('user email')}</FormLabel>
        <InputGroup>
          <Input
            type="text"
            value={getInput('from')}
            onChange={(e) => {
              updateInput('from', e.target.value);
            }}
          />
        </InputGroup>
        <FormErrorMessage>{inputsErrors?.from}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={inputsErrors?.message}
        isRequired={isFieldRequired(validationRules?.message)}
      >
        <FormLabel>{T('user message')}</FormLabel>
        <InputGroup>
          <Textarea
            sx={{ minHeight: '150px' }}
            value={getInput('message')}
            onChange={(e) => {
              updateInput('message', e.target.value);
            }}
          />
        </InputGroup>
        <FormErrorMessage>{inputsErrors?.message}</FormErrorMessage>
      </FormControl>
      {state.isError ? <ErrorMessage message={T(formResult.msg)} /> : null}
      {state.isSuccess ? <SuccessMessage message={T(formResult.msg)} /> : null}
    </Box>
  );
}

ContactForm.defaultProps = {
  formResult: null,
};

ContactForm.prototype.propTypes = {
  formResult: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  getInput: PropTypes.func.isRequired,
  updateInput: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export default function formConfigFactory() {
  return {
    validationGroup: 'ContactFormRequest',
    hook: (onCallFinish) => {
      const { callPost } = useCall(onCallFinish);

      return (inputs) =>
        callPost(config.api.endPointsURLs.processContactForm, inputs);
    },
    formUI: ContactForm,
  };
}
