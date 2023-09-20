import React from 'react';
import { HomePage } from 'src/pages';
import { Route, Routes as RoutesReactDom } from 'react-router-dom';

const routes = [
  {
    name: 'home',
    path: '',
    element: <HomePage />,
  },
  {
    name: 'userActions',
    path: ':action/:actionParams?',
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
      {routes.map(({ name, path, element }) => (
        <Route strict exact key={name} path={path} element={element} />
      ))}
    </RoutesReactDom>
  );
}
