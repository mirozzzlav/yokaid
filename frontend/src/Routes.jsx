import React from 'react';
import { Route, Routes as RoutesReactDom } from 'react-router-dom';
import { MapPage } from 'src/pages';

const routes = [
  {
    name: 'home',
    path: '',
    element: <MapPage />,
  },
  {
    name: 'map',
    path: ':action/:actionParams?',
    element: <MapPage />,
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
