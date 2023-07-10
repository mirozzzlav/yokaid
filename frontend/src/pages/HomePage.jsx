import React from 'react';
import Map from 'src/components/Map';
import MainLayout from 'src/layouts/MainLayout';

export default function HomePage() {
  return (
    <MainLayout mode="fullscreen">
      <Map />
    </MainLayout>
  );
}
