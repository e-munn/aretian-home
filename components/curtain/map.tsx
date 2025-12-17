"use client";
import React, { useState } from 'react';
import { Map } from 'react-map-gl';
import { useInterval } from 'usehooks-ts';
import { MAP_INITIAL_VIEWWSTATES } from '@/lib/constants';

const CurtainMap = () => {
  const [viewState, setViewState] = useState(MAP_INITIAL_VIEWWSTATES[0]);

  useInterval(() => {
    // setBearing((prevBearing) => (prevBearing + 1) % 360);
    setViewState((prevState) => ({
      ...prevState,
      // transitionDuration: 1000,
      // transitionInterpolator: new LinearInterpolator(['bearing']),
      // transitionEasing: d3.easeCubic,
      bearing: (prevState.bearing + 0.05) % 360,
      zoom: prevState.zoom + 0.0001,
    }));
  }, 22);

  return (
    <Map
      // initialViewState={viewState}
      style={{ pointerEvents: 'none' }}
      viewState={viewState}
      // mapStyle={'mapbox://styles/e-munn/clw46doe602mz01qu46nc2wzn'}
      // mapStyle={'mapbox://styles/e-munn/clwp1g6by04ep01nxdovw0dy1'}
      // mapStyle={'mapbox://styles/e-munn/cm1sc0f9m002a01qn26uj8pi4'}
      mapStyle={'mapbox://styles/e-munn/cmhf70dgk007g01qx1c2m4ooj'}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS}
    >
    </Map>
  );
};

export default CurtainMap;
