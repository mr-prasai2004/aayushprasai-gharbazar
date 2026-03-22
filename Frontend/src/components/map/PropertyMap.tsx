import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

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

interface PropertyMapProps {
    latitude: number | null | undefined;
    longitude: number | null | undefined;
    locationText?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ 
    latitude, 
    longitude, 
    locationText = "Property Location"
}) => {
    if (!latitude || !longitude) {
        return (
            <div className="h-80 bg-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-300">
                <div className="text-center">
                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No map coordinates available</p>
                    <p className="text-sm text-gray-400 mt-1">{locationText}</p>
                </div>
            </div>
        );
    }

    const position: [number, number] = [latitude, longitude];

    return (
        <div className="w-full h-80 border border-gray-300 rounded-xl overflow-hidden relative z-0 shadow-sm">
            <MapContainer 
                center={position} 
                zoom={15} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        {locationText}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
