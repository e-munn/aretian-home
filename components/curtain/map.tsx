'use client';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  BASEMAP,
  vectorTableSource,
  fetchMap,
  vectorQuerySource,
  VectorTileLayer,
  HeatmapTileLayer,
  quadbinTableSource,
  quadbinQuerySource,
  QuadbinTileLayer,
  colorBins,
} from '@deck.gl/carto';
import * as d3 from 'd3';
import { DeckGL } from '@deck.gl/react';
import { default as MapGL } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { Map, useControl } from 'react-map-gl';
import { DeckProps } from '@deck.gl/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import '@deck.gl/widgets/stylesheet.css';
import {
  LightingEffect,
  LinearInterpolator,
  _SunLight as SunLight,
  OrbitView,
  PointLight,
  PostProcessEffect,
  FlyToInterpolator,
  MapViewState,
} from '@deck.gl/core';
import { useInterval } from 'usehooks-ts';
import { MAP_INITIAL_VIEWWSTATES } from '@/lib/constants';
import { getEnabledCategories } from 'trace_events';

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const accessToken = process.env.NEXT_PUBLIC_CARTO_ACCESS || '';
const connectionName = 'connection1';
const cartoConfig = { apiBaseUrl, accessToken, connectionName };

const DeckGLOverlay = (props: DeckProps) => {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
};

const CurtainMap = () => {
  const fetchData = async () => {};
  const [layers, setLayers] = useState([]);
  const [focus, setFocus] = useState(null);
  const [bearing, setBearing] = useState(12);
  const [viewState, setViewState] = useState(MAP_INITIAL_VIEWWSTATES[0]);
  const [animate, setAnimate] = useState(0);

  useEffect(() => {
    // const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
    // const mapConfiguration = {
    //   cartoMapId,
    // };
    // fetchMap(mapConfiguration).then((map) => console.log(map))
    // const demoTableSource = vectorTableSource({
    //   accessToken,
    //   connectionName: 'connection1',
    //   tableName: 'aretian-cdt.cdt_v2.nodes-mobility-v1',
    //   spatialDataColumn: 'geo',
    // }).then((source) => {
    //   console.log('1', source)
    // })

    const data = quadbinQuerySource({
      ...cartoConfig,
      aggregationResLevel: 4 + (4 - animate),
      aggregationExp: `SUM(employees) as value`,
      sqlQuery: 'SELECT * FROM `aretian-cdt.cdt_v2.nodes-businesses-v1`',
      spatialDataColumn: 'geo',
    });

    const layer = new QuadbinTileLayer({
      id: 'quadbin_layer',
      data,
      opacity: 1,
      pickable: true,
      extruded: true,
      getFillColor: colorBins({
        attr: 'value',
        domain: [0, 100, 1000, 10000, 100000, 1000000],
        colors: 'Bold',
      }),
      getElevation: (d) =>
        d3.scaleLinear().domain([0, 10000]).range([8, 500])(d.properties.value),
      onHover: (info) => setFocus(info?.object?.properties?.value || null),
      autoHighlight: true,
      highlightColor: [255, 255, 2555, 255],
      elevationScale: animate % 2 ? 0.2 : 1,
      transitions: {
        elevationScale: {
          duration: 3000,
          easing: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
        },
      },
    });

    // data.then((source) => {
    //   console.log('2', source);
    // });
    setLayers(layer);
  }, [animate]);

  useInterval(() => {
    setAnimate((prevAnimate) => (prevAnimate + 1) % 3);
  }, 4000);

  useInterval(() => {
    // setBearing((prevBearing) => (prevBearing + 1) % 360);
    setViewState((prevState) => ({
      ...prevState,
      // transitionDuration: 1000,
      // transitionInterpolator: new LinearInterpolator(['bearing']),
      // transitionEasing: d3.easeCubic,
      bearing: (prevState.bearing + 0.01) % 360,
      zoom: prevState.zoom + 0.0001,
    }));
  }, 22);

  return (
    <Map
      // initialViewState={viewState}
      style={{ pointerEvents: 'none' }}
      viewState={viewState}
      // mapStyle={'mapbox://styles/e-munn/clw46doe602mz01qu46nc2wzn'}
      mapStyle={'mapbox://styles/e-munn/clwp1g6by04ep01nxdovw0dy1'}
      // mapStyle={'mapbox://styles/e-munn/cm1sc0f9m002a01qn26uj8pi4'}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS}
    >
      <DeckGLOverlay
        layers={layers}
        interleaved
        controller={true}
        // onViewStateChange={({ viewState }) => {
        //   console.log(viewState);
        // }}
      />
    </Map>
  );
};

export default CurtainMap;
