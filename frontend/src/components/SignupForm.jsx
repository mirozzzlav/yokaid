import React, { useCallback } from 'react';
import {
  Input,
  FormLabel,
  FormControl,
  Box,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import PropTypes from 'prop-types';
import { useForm, useUser } from 'src/hooks';
const successMessage =
  'sign up has been successful, please check your email for the account activation';

export default function SignupForm({
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
}) {
  const callHook = useCallback((onCallFinish) => {
    const { signupUser } = useUser({ onSignupFinish: onCallFinish });
    return signupUser;
  }, []);

  const { error, inputsErrors, inputs, updateInputs } = useForm(
    isShown,
    setIsShown,
    isSubmitted,
    setIsSubmitted,
    callHook,
    ['firstName', 'lastName', 'email'],
    false,
  );
  console.log(error);
  return (
    <Box>
      <FormControl isInvalid={inputsErrors?.fullName} mb="10px">
        <FormLabel mb={0}>First name</FormLabel>
        <Input
          type="text"
          value={inputs.firstName}
          onChange={(e) => {
            updateInputs('firstName', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.fullName} mb="10px">
        <FormLabel mb={0}>First name</FormLabel>
        <Input
          type="text"
          value={inputs.lastName}
          onChange={(e) => {
            updateInputs('lastName', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.email} mb="15px">
        <FormLabel mb={0}>Email</FormLabel>
        <Input
          type="text"
          value={inputs.email}
          onChange={(e) => {
            updateInputs('email', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.email}</FormErrorMessage>
      </FormControl>

      {error && <ErrorMessage message={error} />}
      {error === '' && <SuccessMessage message={successMessage} />}
    </Box>
  );
}

SignupForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  setIsSubmitted: PropTypes.func.isRequired,
};
