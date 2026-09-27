import { Destination } from "./types";

export type PlaceCategory =
  | "attraction"
  | "hotel"
  | "restaurant";

export type MapPlace = {
  id: string;
  category: PlaceCategory;
  name: string;
  subtitle: string;
  rating: number;
  image: string;
  lat: number;
  lng: number;
  priceLabel?: string;
  href?: string;
};

export function getMapPlaces(destination: Destination): MapPlace[] {
  const attractions: MapPlace[] = destination.attractions.map((a) => ({
    id: `attraction-${a.slug}`,
    category: "attraction",
    name: a.name,
    subtitle: a.category,
    rating: a.rating,
    image: a.image,
    lat: a.lat,
    lng: a.lng,
    href: `/destinations/${destination.slug}/attractions/${a.slug}`,
  }));

  const hotels: MapPlace[] = destination.hotels.map((h) => ({
    id: `hotel-${h.slug}`,
    category: "hotel",
    name: h.name,
    subtitle: h.tier,
    rating: h.rating,
    image: h.image,
    lat: h.lat,
    lng: h.lng,
    priceLabel: `₹${h.pricePerNight.toLocaleString("en-IN")}/night`,
  }));

  const restaurants: MapPlace[] = destination.restaurants.map((r) => ({
    id: `restaurant-${r.slug}`,
    category: "restaurant",
    name: r.name,
    subtitle: r.cuisine,
    rating: r.rating,
    image: r.image,
    lat: r.lat,
    lng: r.lng,
    priceLabel: "₹".repeat(r.priceLevel),
  }));

  return [...attractions, ...hotels, ...restaurants];
}

// Haversine distance in km — used for "nearby" sorting without needing a
// Google Distance Matrix call.
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}
