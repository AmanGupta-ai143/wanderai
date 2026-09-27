"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { Car, PersonStanding, Bike, Bus, Route, X, Sparkles } from "lucide-react";
import { MapPlace } from "@/lib/map-data";

type Mode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

export default function RoutePlanner({
  places,
  onClose,
}: {
  places: MapPlace[];
  onClose: () => void;
}) {
  const map = useMap();
  const [planMode, setPlanMode] = useState<"single" | "multi">("single");

  const [fromId, setFromId] = useState(places[0]?.id ?? "");
  const [toId, setToId] = useState(places[1]?.id ?? "");
  const [mode, setMode] = useState<Mode>("DRIVING");
  const [result, setResult] = useState<{ distance: string; duration: string } | null>(null);

  const [startId, setStartId] = useState(places[0]?.id ?? "");
  const [endId, setEndId] = useState(places[0]?.id ?? "");
  const [stopIds, setStopIds] = useState<Set<string>>(new Set());
  const [optimized, setOptimized] = useState<{ order: string[]; distance: string; duration: string } | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    const renderer = new google.maps.DirectionsRenderer({ map, suppressMarkers: false });
    rendererRef.current = renderer;
    return () => renderer.setMap(null);
  }, [map]);

  function resetResults() {
    setError(null);
    setResult(null);
    setOptimized(null);
  }

  function getRoute() {
    resetResults();
    if (typeof google === "undefined") {
      setError("Google Maps script hasn't loaded (missing API key).");
      return;
    }
    const from = places.find((p) => p.id === fromId);
    const to = places.find((p) => p.id === toId);
    if (!from || !to || !rendererRef.current) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: { lat: from.lat, lng: from.lng },
        destination: { lat: to.lat, lng: to.lng },
        travelMode: google.maps.TravelMode[mode],
      },
      (response, status) => {
        if (status === "OK" && response) {
          rendererRef.current?.setDirections(response);
          const leg = response.routes[0].legs[0];
          setResult({ distance: leg.distance?.text ?? "—", duration: leg.duration?.text ?? "—" });
        } else {
          setError("Couldn't find a route between those two places.");
        }
      }
    );
  }

  function toggleStop(id: string) {
    setStopIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function optimizeRoute() {
    resetResults();
    if (typeof google === "undefined") {
      setError("Google Maps script hasn't loaded (missing API key).");
      return;
    }
    const start = places.find((p) => p.id === startId);
    const end = places.find((p) => p.id === endId);
    const waypointPlaces = places.filter((p) => stopIds.has(p.id) && p.id !== startId && p.id !== endId);

    if (!start || !end || !rendererRef.current) return;
    if (waypointPlaces.length === 0) {
      setError("Select at least one stop to optimize between your start and end.");
      return;
    }
    if (waypointPlaces.length > 8) {
      setError("Google's Directions API supports up to 8 waypoints at once — deselect a few stops.");
      return;
    }

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        waypoints: waypointPlaces.map((p) => ({ location: { lat: p.lat, lng: p.lng } })),
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[mode],
      },
      (response, status) => {
        if (status === "OK" && response) {
          rendererRef.current?.setDirections(response);
          const route = response.routes[0];
          const orderedWaypoints = (route.waypoint_order ?? []).map((idx) => waypointPlaces[idx].name);
          const order = [start.name, ...orderedWaypoints, end.name];

          let totalDistanceM = 0;
          let totalDurationS = 0;
          route.legs.forEach((leg) => {
            totalDistanceM += leg.distance?.value ?? 0;
            totalDurationS += leg.duration?.value ?? 0;
          });

          setOptimized({
            order,
            distance: `${(totalDistanceM / 1000).toFixed(1)} km`,
            duration: `${Math.round(totalDurationS / 60)} min`,
          });
        } else {
          setError("Couldn't optimize a route between those stops.");
        }
      }
    );
  }

  const modeButtons: { key: Mode; label: string; icon: typeof Car }[] = [
    { key: "DRIVING", label: "Driving", icon: Car },
    { key: "WALKING", label: "Walking", icon: PersonStanding },
    { key: "BICYCLING", label: "Cycling", icon: Bike },
    { key: "TRANSIT", label: "Transit", icon: Bus },
  ];

  return (
    <div className="absolute top-5 right-5 w-[320px] max-h-[calc(100%-2.5rem)] overflow-y-auto bg-paper rounded-2xl shadow-2xl p-5 z-10">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-lg flex items-center gap-2">
          <Route size={16} className="text-terracotta" /> Plan your route
        </p>
        <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setPlanMode("single");
            resetResults();
          }}
          className={`flex-1 text-xs font-medium rounded-full py-2 transition-colors ${
            planMode === "single" ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
          }`}
        >
          Single route
        </button>
        <button
          onClick={() => {
            setPlanMode("multi");
            resetResults();
          }}
          className={`flex-1 text-xs font-medium rounded-full py-2 transition-colors flex items-center justify-center gap-1 ${
            planMode === "multi" ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
          }`}
        >
          <Sparkles size={11} /> Optimize stops
        </button>
      </div>

      {planMode === "single" ? (
        <>
          <label className="block text-xs text-muted mb-1">From</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full mb-3 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-paper"
          >
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="block text-xs text-muted mb-1">To</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full mb-4 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-paper"
          >
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label className="block text-xs text-muted mb-1">Starting from</label>
          <select
            value={startId}
            onChange={(e) => setStartId(e.target.value)}
            className="w-full mb-3 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-paper"
          >
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="block text-xs text-muted mb-1">Ending at</label>
          <select
            value={endId}
            onChange={(e) => setEndId(e.target.value)}
            className="w-full mb-3 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-paper"
          >
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="block text-xs text-muted mb-1.5">
            Stops to visit ({stopIds.size} selected)
          </label>
          <div className="max-h-32 overflow-y-auto mb-4 space-y-1 rounded-lg border border-ink/10 p-2">
            {places
              .filter((p) => p.id !== startId && p.id !== endId)
              .map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopIds.has(p.id)}
                    onChange={() => toggleStop(p.id)}
                    className="accent-terracotta"
                  />
                  {p.name}
                </label>
              ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-4 gap-2 mb-4">
        {modeButtons.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            title={label}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] transition-colors ${
              mode === key ? "bg-terracotta text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={planMode === "single" ? getRoute : optimizeRoute}
        className="w-full rounded-full bg-ink text-paper text-sm font-medium py-2.5 hover:bg-ink/90 transition-colors"
      >
        {planMode === "single" ? "Get Route" : "Optimize Route"}
      </button>

      {result && (
        <div className="mt-4 flex items-center justify-between text-sm border-t border-ink/10 pt-3">
          <span className="text-ink/80">{result.distance}</span>
          <span className="text-ink/80">{result.duration}</span>
        </div>
      )}

      {optimized && (
        <div className="mt-4 border-t border-ink/10 pt-3">
          <p className="text-xs text-muted mb-2">Best order</p>
          <ol className="text-sm space-y-1 mb-3">
            {optimized.order.map((name, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-terracotta/15 text-terracotta text-[10px] grid place-items-center shrink-0">
                  {i + 1}
                </span>
                {name}
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/80">{optimized.distance}</span>
            <span className="text-ink/80">{optimized.duration}</span>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-terracotta">{error}</p>}
    </div>
  );
}
