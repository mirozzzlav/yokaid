import React from 'react';
import {
  Input,
  FormLabel,
  FormControl,
  Box,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import PropTypes from 'prop-types';
import { useForm, useSignupCall } from 'src/hooks';

const successMessage =
  'sign up has been successful, please check your email for the account activation';

export default function SignupForm({
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
}) {
  const { isError, errorMsg, isSuccess, inputsErrors, inputs, updateInputs } =
    useForm(
      isShown,
      setIsShown,
      isSubmitted,
      setIsSubmitted,
      useSignupCall,
      ['fullName', 'email'],
      false,
    );
  return (
    <Box>
      <FormControl isInvalid={inputsErrors?.fullName} mb="10px">
        <FormLabel mb={0}>Full name</FormLabel>
        <Input
          type="text"
          value={inputs.fullName}
          onChange={(e) => {
            updateInputs('fullName', e.target.value);
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

      {isError() ? <ErrorMessage message={errorMsg} /> : null}
      {isSuccess() ? <SuccessMessage message={successMessage} /> : null}
    </Box>
  );
}

SignupForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  setIsSubmitted: PropTypes.func.isRequired,
};
