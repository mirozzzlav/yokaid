import React, { useCallback } from 'react';
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
import { theme } from 'src/style';
import { ErrorMessage } from 'src/components/Messages';
import { useUser, useForm } from 'src/hooks';

export default function LoginForm({
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
}) {
  const callHook = useCallback((onCallFinish) => {
    const { loginUser } = useUser({ onLoginFinish: onCallFinish });
    return loginUser;
  }, []);

  const { error, inputsErrors, inputs, updateInputs } = useForm(
    isShown,
    setIsShown,
    isSubmitted,
    setIsSubmitted,
    callHook,
    ['usernameOrEmail', 'password'],
  );

  return (
    <Box>
      <FormControl mb="10px" isInvalid={inputsErrors?.usernameOrEmail}>
        <FormLabel mb={0}>Username or email</FormLabel>
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
        <FormLabel mb={0}>Password</FormLabel>
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
      {error && <ErrorMessage message={error} />}
    </Box>
  );
}

LoginForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  setIsSubmitted: PropTypes.func.isRequired,
};
