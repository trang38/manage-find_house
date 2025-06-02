import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerText?: string;
}

const GoongMap: React.FC<MapProps> = ({
  latitude,
  longitude,
  zoom = 14,
  markerText = 'Vị trí',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null); 

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.setCenter([longitude, latitude]);
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${process.env.REACT_APP_GOONG_MAPS_MAPTILES_KEY}`,
      center: [longitude, latitude],
      zoom,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setText(markerText))
      .addTo(mapInstance);

    mapRef.current = mapInstance;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerText]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', borderRadius: '8px' }}
    />
  );
};

export default GoongMap;