import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';

// This component listens to map dragging and updates our center coordinates
const MapTracker = ({ setMapCenter }) => {
    useMapEvents({
        moveend: (e) => {
            const center = e.target.getCenter();
            setMapCenter([center.lat, center.lng]);
        }
    });
    return null;
};

export default function LocationPickerModal({ isOpen, onClose, onConfirm }) {
    // Default location: New Delhi (you can change these coordinates)
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [isLocating, setIsLocating] = useState(false);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    // Get user's actual GPS location
    const locateUser = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Location error:", error);
                    setIsLocating(false);
                    alert("Could not get your location. Please ensure location services are enabled.");
                }
            );
        } else {
            setIsLocating(false);
            alert("Geolocation is not supported by your browser.");
        }
    };

    // Reverse Geocode: Turn Coordinates into a Text Address
    const handleConfirm = async () => {
        setIsFetchingAddress(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapCenter[0]}&lon=${mapCenter[1]}&zoom=18&addressdetails=1`);
            const data = await response.json();

            if (data && data.display_name) {
                // Pass the string back to the Cart Page
                onConfirm(data.display_name);
            } else {
                alert("Could not identify the address for this location.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Failed to fetch address details.");
        } finally {
            setIsFetchingAddress(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl h-[600px] flex flex-col shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-black text-[#0B2C5A] tracking-tight uppercase">Pin Your Location</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="relative flex-grow bg-slate-100">
                    <MapContainer
                        center={mapCenter}
                        zoom={15}
                        className="w-full h-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <MapTracker setMapCenter={setMapCenter} />
                    </MapContainer>

                    {/* Fixed Center Pin (UI Overlay) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none drop-shadow-xl text-[#0B2C5A]">
                        <MapPin className="w-12 h-12 fill-white" />
                        <div className="w-3 h-3 bg-[#0B2C5A] rounded-full mx-auto -mt-2 shadow-md"></div>
                    </div>

                    {/* Locate Me Button */}
                    <button
                        onClick={locateUser}
                        disabled={isLocating}
                        className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-[#0B2C5A] hover:bg-slate-50 transition-colors"
                        title="Use my current location"
                    >
                        {isLocating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
                        Drag the map to position the pin exactly on your delivery location.
                    </p>
                    <button
                        onClick={handleConfirm}
                        disabled={isFetchingAddress}
                        className="w-full md:w-auto bg-[#00A152] hover:bg-[#008a46] disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-xl transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00A152]/20"
                    >
                        {isFetchingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Address'}
                    </button>
                </div>
            </div>
        </div>
    );
}