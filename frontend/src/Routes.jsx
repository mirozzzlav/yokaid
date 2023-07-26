import React from 'react';
import { HomePage } from 'src/pages';
import { Route, Routes as RoutesReactDom } from 'react-router-dom';

const routes = [
  {
    name: 'home',
    route: '',
    element: <HomePage />,
  },
  {
    name: 'userActions',
    route: ':action',
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
