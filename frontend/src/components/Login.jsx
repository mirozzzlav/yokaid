import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from 'src/providers';
import { Link } from 'react-router-dom';
import { Input, FormLabel, FormControl, Flex, Box } from '@chakra-ui/react';
import { theme } from 'src/style';
import ErrorMessage from 'src/components/ErrorMessage';

export function LoginUI({ credentials, updateCredentials, error }) {
  return (
    <Box>
      <FormControl isInvalid={false} mb="10px">
        <FormLabel mb={0}>Username or email</FormLabel>
        <Input
          type="email"
          value={credentials.usernameOrEmail}
          onChange={(e) => {
            updateCredentials('usernameOrEmail', e.target.value);
          }}
        />
      </FormControl>
      <FormControl isInvalid={false}>
        <FormLabel mb={0}>Password</FormLabel>
        <Input
          type="password"
          value={credentials.password}
          onChange={(e) => {
            updateCredentials('password', e.target.value);
          }}
        />
      </FormControl>
      <Flex
        mt={0}
        mb="10px"
        justifyContent="space-between"
        fontWeight={theme.fontWeights.light}
      >
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Sign up</Link>
      </Flex>
      {error && <ErrorMessage error={error} />}
    </Box>
  );
}

LoginUI.defaultProps = {
  error: '',
};
LoginUI.propTypes = {
  credentials: PropTypes.shape({
    usernameOrEmail: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  updateCredentials: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default function Login({ submit, onLoginFinish, isActive }) {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const updateCredentials = useCallback((name, val) => {
    setCredentials((prevData) => ({ ...prevData, [name]: val }));
  }, []);

  const { loginUser, responseMeta, response } = useContext(AuthContext);
  const [error, setError] = useState('');

  useEffect(() => {
    if (submit && responseMeta.isFinished && onLoginFinish) {
      onLoginFinish(!response.error);
    }
    if (responseMeta.isFinished && response.error) {
      setError(response.error.msg || 'Login failed');
    }
  }, [responseMeta, response]);

  useEffect(() => {
    if (submit) {
      loginUser(credentials);
    }
  }, [submit, credentials]);

  useEffect(() => {
    setError('');
  }, [isActive]);

  return (
    <LoginUI
      credentials={credentials}
      updateCredentials={updateCredentials}
      error={error}
    />
  );
}

Login.defaultProps = {
  onLoginFinish: () => {},
};

Login.propTypes = {
  submit: PropTypes.bool.isRequired,
  onLoginFinish: PropTypes.func,
  isActive: PropTypes.bool.isRequired,
};
