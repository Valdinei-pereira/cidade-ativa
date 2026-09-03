import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const iconeMarcador = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CentralizarMapaProps {
  latitude: number | null;
  longitude: number | null;
}

function CentralizarMapa({
  latitude,
  longitude,
}: CentralizarMapaProps) {
  const mapa = useMap();

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      mapa.setView([latitude, longitude], 17);
      setTimeout(() => {
        mapa.invalidateSize();
      }, 100);
    }
  }, [latitude, longitude, mapa]);

  return null;
}

interface CliqueMapaProps {
  onSelecionar: (
    latitude: number,
    longitude: number
  ) => void;
}

function CliqueMapa({
  onSelecionar,
}: CliqueMapaProps) {
  useMapEvents({
    click(event) {
      onSelecionar(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

interface MapaProps {
  latitude: number | null;
  longitude: number | null;
  onSelecionar: (
    latitude: number,
    longitude: number
  ) => void;
}

function Mapa({
  latitude,
  longitude,
  onSelecionar,
}: MapaProps) {
  const posicaoInicial: [number, number] = [
    latitude ?? -23.0834,
    longitude ?? -46.8999,
  ];

  return (
    <div
      className="mapa-real"
      style={{
        width: "100%",
        height: "360px",
        minHeight: "360px",
        marginTop: "20px",
        overflow: "hidden",
        borderRadius: "12px",
        position: "relative",
      }}
    >
      <MapContainer
        center={posicaoInicial}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "360px",
          zIndex: 1,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CentralizarMapa
          latitude={latitude}
          longitude={longitude}
        />

        <CliqueMapa
          onSelecionar={onSelecionar}
        />

        {latitude !== null &&
          longitude !== null && (
            <Marker
              position={[latitude, longitude]}
              icon={iconeMarcador}
            />
          )}
      </MapContainer>
    </div>
  );
}

export default Mapa;
