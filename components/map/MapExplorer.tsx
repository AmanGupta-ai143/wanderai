"use client";

import { useMemo, useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { LocateFixed, Route as RouteIcon, MapPinOff } from "lucide-react";
import { Destination } from "@/lib/types";
import { getMapPlaces, MapPlace, distanceKm } from "@/lib/map-data";
import FilterPanel, { MapFilters } from "./FilterPanel";
import PlacePopup from "./PlacePopup";
import RoutePlanner from "./RoutePlanner";

const PIN_COLORS: Record<MapPlace["category"], string> = {
  attraction: "#C86B4A", // terracotta
  hotel: "#68745B", // olive
  restaurant: "#D7A84B", // gold
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function MapExplorer({ destination }: { destination: Destination }) {
  const allPlaces = useMemo(() => getMapPlaces(destination), [destination]);
  const [filters, setFilters] = useState<MapFilters>({
    categories: new Set(["attraction", "hotel", "restaurant"]),
    minRating: 0,
  });
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const filtered = allPlaces.filter(
    (p) => filters.categories.has(p.category) && p.rating >= filters.minRating
  );

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="grid md:grid-cols-[280px_1fr] h-full">
        <div className="border-r border-ink/10 hidden md:block">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
        <div className="flex flex-col items-center justify-center text-center px-8 bg-sand/40">
          <MapPinOff size={28} className="text-muted mb-4" strokeWidth={1.5} />
          <p className="font-display text-xl mb-2">Map needs a Google Maps API key</p>
          <p className="text-sm text-muted max-w-sm">
            Set <code className="bg-ink/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
            in <code className="bg-ink/10 px-1.5 py-0.5 rounded">.env</code> to load the live map.
            Filters and place data below are already wired up.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-md w-full text-left">
            {filtered.slice(0, 4).map((p) => (
              <div key={p.id} className="rounded-xl bg-paper border border-ink/10 p-3">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="grid md:grid-cols-[280px_1fr] h-full">
        <div className="border-r border-ink/10 hidden md:block">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="relative h-full">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={destination.center}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            onClick={() => setSelected(null)}
          >
            {filtered.map((place) => (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelected(place)}
              >
                <Pin
                  background={PIN_COLORS[place.category]}
                  borderColor="#17211D"
                  glyphColor="#FAF8F3"
                />
              </AdvancedMarker>
            ))}

            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="w-4 h-4 rounded-full bg-[#4285F4] border-2 border-white shadow" />
              </AdvancedMarker>
            )}
          </Map>

          <div className="absolute top-5 left-5 flex gap-2 z-10">
            <button
              onClick={locateMe}
              className="flex items-center gap-2 bg-paper rounded-full shadow-md px-4 py-2.5 text-sm font-medium hover:bg-sand transition-colors"
            >
              <LocateFixed size={15} className={locating ? "animate-pulse" : ""} />
              {locating ? "Locating…" : "Near me"}
            </button>
            {!showRoutePlanner && (
              <button
                onClick={() => setShowRoutePlanner(true)}
                className="flex items-center gap-2 bg-paper rounded-full shadow-md px-4 py-2.5 text-sm font-medium hover:bg-sand transition-colors"
              >
                <RouteIcon size={15} /> Route
              </button>
            )}
          </div>

          {showRoutePlanner && (
            <RoutePlanner places={allPlaces} onClose={() => setShowRoutePlanner(false)} />
          )}

          {selected && (
            <PlacePopup
              place={selected}
              from={userLocation}
              onClose={() => setSelected(null)}
              onGetDirections={() => {
                setShowRoutePlanner(true);
                setSelected(null);
              }}
            />
          )}

          {userLocation && (
            <div className="absolute bottom-5 right-5 bg-paper rounded-xl shadow-md px-4 py-3 text-xs z-10 max-w-[180px]">
              <p className="text-muted mb-1.5">Nearby</p>
              {filtered
                .slice()
                .sort((a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b))
                .slice(0, 3)
                .map((p) => (
                  <div key={p.id} className="flex justify-between gap-3 py-0.5">
                    <span className="truncate">{p.name}</span>
                    <span className="text-muted shrink-0">
                      {distanceKm(userLocation, p).toFixed(1)} km
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  );
}
