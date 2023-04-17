import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from 'src/providers';

export function LoginUI({ credentials, updateCredentials, onLoginSubmit }) {
  return (
    <div>
      <label htmlFor="username">
        Username
        <input
          type="text"
          value={credentials.username}
          onChange={(e) => updateCredentials('username', e.target.value)}
          id="username"
        />
      </label>
      <label htmlFor="password">
        Password
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => updateCredentials('password', e.target.value)}
          id="password"
        />
      </label>
      <button type="submit" onClick={onLoginSubmit}>
        Login
      </button>
    </div>
  );
}

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const updateCredentials = useCallback((name, val) => {
    setCredentials((prevData) => ({ ...prevData, [name]: val }));
  }, []);

  const { loginUser } = useContext(AuthContext);

  const onLoginSubmit = useCallback(
    () => loginUser(credentials),
    [credentials],
  );

  return (
    <LoginUI
      credentials={credentials}
      updateCredentials={updateCredentials}
      onLoginSubmit={onLoginSubmit}
    />
  );
}

LoginUI.propTypes = {
  credentials: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  updateCredentials: PropTypes.func.isRequired,
  onLoginSubmit: PropTypes.func.isRequired,
};
