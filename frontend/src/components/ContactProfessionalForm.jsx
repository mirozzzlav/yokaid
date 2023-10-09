import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  FormLabel,
  FormControl,
  Box,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import config from 'src/config';
import useCall from '../hooks/useCall';

const successMessage = 'Your message has been sent to professional.';

const style = {
  message: {
    minHeight: '200px',
  },
};

export default function ContactProfessionalForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  validationRules,
}) {
  return (
    <Box>
      <FormControl
        isInvalid={inputsErrors?.userPhone}
        isRequired={isFieldRequired(validationRules?.userPhone)}
      >
        <FormControl>
          <InfoMessage message="Once you submit a message using this form, we will re-send it via SMS to the selected professional." />
        </FormControl>
        <FormLabel>Phone</FormLabel>
        <Input
          type="text"
          placeholder="Your phone number"
          value={inputs.userPhone}
          onChange={(e) => {
            updateInputs('userPhone', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.userPhone}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.message}
        isRequired={isFieldRequired(validationRules?.message)}
      >
        <FormLabel>Message</FormLabel>
        <Textarea
          sx={style.message}
          value={inputs.message}
          onChange={(e) => {
            updateInputs('message', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.message}</FormErrorMessage>
      </FormControl>

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? <SuccessMessage message={successMessage} /> : null}
    </Box>
  );
}

ContactProfessionalForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export function formFactory(professionalId) {
  return {
    inputNames: ['userPhone', 'message'],
    hook: (onCallFinish) => {
      const call = useCall(onCallFinish);
      return (inputs) =>
        call(config.api.endPointsURLs.contactProfessional, 'post', inputs);
    },
    formUI: ContactProfessionalForm,
    validationRulesNames: ['contactProfessionalRequest'],
    inputsToRequestMapper: (inputs) => ({
      ...inputs,
      professionalId,
    }),
  };
}
