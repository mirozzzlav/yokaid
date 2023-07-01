import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from 'src/providers';
import { Link } from 'react-router-dom';

export function LoginUI({ credentials, updateCredentials, onLoginSubmit }) {
  return (
    <div className="flex items-center justify-center">
      <form onSubmit={onLoginSubmit}>
        <div className="p-10 m-10 sm:p-15 sm:m-5 w-96 bg-white rounded-lg shadow">
          <h1 className="font-semibold w-full text-3xl mb-7 text-center">Login to your account</h1>
          <div className="rounded w-full">
            <label htmlFor="username_or_email">
              <span className="LabelText">Email or Username</span>
              <input
                className="Input"
                type="text"
                value={credentials.username_or_email}
                onChange={(e) => updateCredentials('username_or_email', e.target.value)}
                id="username_or_email"
              />
              <p className="text-red-500 text-xs italic" />
            </label>
            <label htmlFor="password">
              <span className="LabelText">Password</span>
              <input
                className="Input"
                type="password"
                value={credentials.password}
                onChange={(e) => updateCredentials('password', e.target.value)}
                id="password"
              />
              <p className="text-red-500 text-xs italic" />
            </label>
            <button className="Button" type="submit">
              Login
            </button>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline text-blue-700">Forgot password?</Link>
            </div>
            <p className="text-sm font-light text-gray-500 mt-5">
              <span className="float-left text-sm font-medium text-primary-600 mr-10"> Don’t have an account yet?</span>
              <Link to="/signup" className="text-sm font-medium text-primary-600 hover:underline text-blue-700">Sign up</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function Login() {
  const [credentials, setCredentials] = useState({
    username_or_email: '',
    password: '',
  });
  const updateCredentials = useCallback((name, val) => {
    setCredentials((prevData) => ({ ...prevData, [name]: val }));
  }, []);

  const { loginUser } = useContext(AuthContext);

  const onLoginSubmit = useCallback(
    (event) => {
      event.preventDefault();
      loginUser(credentials);
    },
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
    username_or_email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  updateCredentials: PropTypes.func.isRequired,
  onLoginSubmit: PropTypes.func.isRequired,
};
