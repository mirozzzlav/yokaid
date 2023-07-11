import React, { useContext } from 'react';
import MainLayout from 'src/layouts/MainLayout';
import useMapSearch from 'src/hooks/useMapSearch';
import { SearchDropdown } from 'src/components/Dropdown';
import Map from 'src/components/Map';
import { MapContext } from 'src/providers/MapProvider';

export default function HomePage() {
  const { setMapPosition } = useContext(MapContext);
  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <SearchDropdown
          searchResponseGetter={useMapSearch}
          onItemClick={setMapPosition}
        />
      }
    >
      <Map />
    </MainLayout>
  );
}
