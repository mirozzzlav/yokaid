import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  FormLabel,
  FormControl,
  Box,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import { useSignupCall } from 'src/hooks';
import theme from 'src/style';

const successMessage =
  'sign up has been successful, please check your email for the account activation';

export default function SignupForm({
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
        isInvalid={inputsErrors?.fullName}
        isRequired={isFieldRequired(validationRules?.fullName)}
      >
        <FormLabel>Full name</FormLabel>
        <Input
          type="text"
          value={inputs.fullName}
          onChange={(e) => {
            updateInputs('fullName', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.email}
        isRequired={isFieldRequired(validationRules?.email)}
      >
        <FormLabel>Email</FormLabel>
        <Input
          type="text"
          value={inputs.email}
          onChange={(e) => {
            updateInputs('email', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.email}</FormErrorMessage>
      </FormControl>

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? <SuccessMessage message={successMessage} /> : null}
    </Box>
  );
}

SignupForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export function formFactory() {
  return {
    inputNames: ['fullName', 'email'],
    hook: useSignupCall,
    formUI: SignupForm,
    validationRulesNames: ['registerUserRequest'],
    inputsToRequestMapper: (inputs) => ({
      ...inputs,
      role: 'guest',
    }),
  };
}
