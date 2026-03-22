import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    initialLatitude?: number | null;
    initialLongitude?: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<{
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

export const MapPicker: React.FC<MapPickerProps> = ({ 
    initialLatitude, 
    initialLongitude, 
    onLocationSelect 
}) => {
    // Default to Kathmandu, Nepal
    const defaultPosition: [number, number] = [27.7172, 85.3240];
    
    const [position, setPosition] = useState<[number, number] | null>(
        initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
    );

    return (
        <div className="w-full h-[300px] border border-gray-300 rounded-md overflow-hidden relative z-0">
            <MapContainer 
                center={position || defaultPosition} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    onLocationSelect={onLocationSelect} 
                />
            </MapContainer>
        </div>
    );
};
