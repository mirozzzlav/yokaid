import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Input,
  FormLabel,
  FormControl,
  Flex,
  Box,
  FormErrorMessage,
} from '@chakra-ui/react';
import theme from 'src/style';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import { useLoginCall } from 'src/hooks';
import { unknownObjectValidator } from 'src/helpers';

export default function LoginForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
}) {
  return (
    <Box sx={theme.styles.global.formWrapper}>
      <FormControl isInvalid={inputsErrors?.usernameOrEmail}>
        <FormLabel>Username or email</FormLabel>
        <Input
          type="email"
          value={inputs.usernameOrEmail}
          onChange={(e) => {
            updateInputs('usernameOrEmail', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.usernameOrEmail}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.password}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={inputs.password}
          onChange={(e) => {
            updateInputs('password', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.password}</FormErrorMessage>
      </FormControl>
      <Flex
        mt="15px"
        mb="5px"
        justifyContent="space-between"
        fontWeight={theme.fontWeights.light}
      >
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Sign up</Link>
      </Flex>
      {state.isError && <ErrorMessage message={errorMsg} />}
      {state.isSuccess ? <SuccessMessage message="successful login" /> : null}
    </Box>
  );
}

LoginForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
};

export function formFactory() {
  return {
    inputNames: ['usernameOrEmail', 'password'],
    hook: useLoginCall,
    formUI: LoginForm,
  };
}
