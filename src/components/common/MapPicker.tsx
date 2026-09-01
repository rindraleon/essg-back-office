/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locate, MapPin, Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FloatingInput } from '../ui/floating-input';
import { Button } from '../ui/button';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  label?: string;
}

const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  label = 'Sélectionner un emplacement sur la carte',
}) => {
  const lat = typeof latitude === 'string' ? Number.parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? Number.parseFloat(longitude) : longitude;

  const [position, setPosition] = useState<[number, number]>(
    lat && lng ? [lat, lng] : [48.8566, 2.3522]
  );
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState(false);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
      setManualLat(lat.toString());
      setManualLng(lng.toString());
    }
  }, [lat, lng]);

  const handleManualLatChange = (value: string) => {
    setManualLat(value);
    const lat = Number.parseFloat(value);
    if (!Number.isNaN(lat) && lat >= -90 && lat <= 90) {
      const lng = position[1];
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
      setIsManualEdit(true);
    }
  };

  const handleManualLngChange = (value: string) => {
    setManualLng(value);
    const lng = Number.parseFloat(value);
    if (!Number.isNaN(lng) && lng >= -180 && lng <= 180) {
      const lat = position[0];
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
      setIsManualEdit(true);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setManualLat(lat.toFixed(7));
    setManualLng(lng.toFixed(7));
    setIsManualEdit(false);
    onLocationChange(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          onLocationChange(latitude, longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  return (
    <div className="w-full space-y-3">
      {label && <p className="font-semibold text-ink-700 mb-2">{label}</p>}

      <div className="rounded-xl overflow-hidden border border-ink-100">
        <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <Marker position={position}>
            <Popup>
              <div>
                <p className="font-semibold text-sm">Emplacement sélectionné</p>
                <p className="text-xs text-ink-600">
                  {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-3 p-3 bg-ink-50 rounded-lg border border-ink-100">
        <div className="flex items-center gap-2 mb-2">
          <Pencil className="size-4 text-ink-600" />
          <p className="font-semibold text-ink-700 text-sm">Saisie manuelle des coordonnées</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput
            label="Latitude"
            type="number"
            value={manualLat}
            onChange={(e) => handleManualLatChange(e.target.value)}
            onBlur={() => {
              if (!isManualEdit) {
                setManualLat(position[0].toFixed(7));
              }
            }}
            min={-90}
            max={90}
            step={0.0000001}
          />
          <FloatingInput
            label="Longitude"
            type="number"
            value={manualLng}
            onChange={(e) => handleManualLngChange(e.target.value)}
            onBlur={() => {
              if (!isManualEdit) {
                setManualLng(position[1].toFixed(7));
              }
            }}
            min={-180}
            max={180}
            step={0.0000001}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="size-4 text-ink-500" />
          <span className="text-ink-600">
            <span className="font-semibold">Lat:</span> {position[0].toFixed(5)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="size-4 text-ink-500" />
          <span className="text-ink-600">
            <span className="font-semibold">Lng:</span> {position[1].toFixed(5)}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleGetCurrentLocation}
          title="Utiliser ma position actuelle"
          className="h-8 w-8"
        >
          <Locate className="size-4 text-brand-600" />
        </Button>
      </div>
    </div>
  );
};

export default MapPicker;
