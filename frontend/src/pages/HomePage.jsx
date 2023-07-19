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
          positionSetup="center"
        />
      }
    >
      <Map />
    </MainLayout>
  );

  // markers = [
  //   {
  //     position: [51.5, -0.07],
  //     component: (
  //       <MapPost
  //         headline="this is Robo"
  //         text="I lend this shiny robot for 5 euros a day, it helps and won't do any harm."
  //         imageSrc="https://wallpapershome.com/images/pages/pic_h/2859.jpg"
  //       />
  //     ),
  //   },
  //   {
  //     position: [51.53, -0.05],
  //     component: (
  //       <MapPost
  //         headline="Anoying cat"
  //         text="I need to get rid of this cat, please..."
  //         imageSrc="https://www.rd.com/wp-content/uploads/2019/09/Cute-cat-lying-on-his-back-on-the-carpet.-Breed-British-mackerel-with-yellow-eyes-and-a-bushy-mustache.-Close-up-e1573490045672.jpg"
  //       />
  //     ),
  //   },
  // ];
}
