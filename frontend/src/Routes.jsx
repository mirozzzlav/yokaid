import React from 'react';
import {
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  NewPasswordPage,
  SignupPage,
} from 'src/pages';
import { Route, Routes as RoutesReactDom } from 'react-router-dom';

const routes = [
  {
    name: 'login',
    route: 'login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'signup',
    route: 'signup',
    element: <SignupPage />,
    public: true,
  },
  {
    name: 'forgot-password',
    route: 'forgot-password',
    element: <ForgotPasswordPage />,
    public: true,
  },
  {
    name: 'new-password',
    route: 'new-password',
    element: <NewPasswordPage />,
    public: true,
  },
  {
    name: 'home',
    route: '',
    element: <HomePage />,
  },
];

export function isPublicRoute(routeToCheck) {
  const routeStripped = routeToCheck.replace(/^\//, '');

  return !!routes
    .filter((route) => route.public)
    .find((route) => routeStripped.includes(route));
}

export default function Routes() {
  return (
    <RoutesReactDom>
      {routes.map(({ name, route, element }) => (
        <Route key={name} path={route} element={element} />
      ))}
    </RoutesReactDom>
  );
}
