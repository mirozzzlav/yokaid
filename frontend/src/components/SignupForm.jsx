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
import { unknownObjectValidator } from 'src/helpers';
import { useSignupCall } from 'src/hooks';
import { globalStyle } from 'src/style';

const successMessage =
  'sign up has been successful, please check your email for the account activation';

export default function SignupForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
}) {
  return (
    <Box sx={globalStyle.formWrapper}>
      <FormControl isInvalid={inputsErrors?.fullName}>
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
      <FormControl isInvalid={inputsErrors?.email}>
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
};

export function formFactory() {
  return {
    inputNames: ['fullName', 'email'],
    hook: useSignupCall,
    formUI: SignupForm,
  };
}
