import { getDestinationBySlug } from "./repository";

// NOTE: rule-based, same pattern as the itinerary/recommender generators —
// derives a checklist from the destination's climate + trip length +
// selected activities. A future LLM version would take the same
// request/response shape.

export type PackingCategory = {
  category: string;
  items: string[];
};

export async function generatePackingList(
  destinationSlug: string,
  days: number,
  activities: string[]
): Promise<PackingCategory[] | null> {
  const dest = await getDestinationBySlug(destinationSlug);
  if (!dest) return null;

  const temp = dest.weather.tempC;
  const cold = temp < 18;
  const hot = temp > 32;
  const act = activities.map((a) => a.toLowerCase());

  const essentials = [
    "Phone charger & power bank",
    "ID / passport & printed hotel confirmation",
    "Reusable water bottle",
    "Basic first-aid kit & any personal medication",
    days > 5 ? "Laundry bag & travel detergent sheets" : "Extra socks & underwear",
  ];

  const clothing: string[] = [];
  if (cold) {
    clothing.push("Warm jacket", "Thermal base layers", "Gloves & a beanie", "Closed walking shoes");
  } else if (hot) {
    clothing.push("Lightweight, breathable clothing", "Wide-brim hat", "Sunglasses", "Sandals or breathable shoes");
  } else {
    clothing.push("Light layers for variable temps", "A light jacket for evenings", "Comfortable walking shoes");
  }
  clothing.push(days <= 7 ? `${days} days worth of daywear` : `A week's worth of daywear (plan to do laundry)`);

  const documents = [
    "Government-issued ID",
    "Travel insurance details",
    "Hotel & transport bookings (offline copies)",
    "Emergency contact list",
  ];

  const extras: string[] = ["Sunscreen", "Hand sanitizer"];
  if (act.some((a) => a.includes("adventure") || a.includes("trek"))) {
    extras.push("Trekking shoes", "Rain shell / windbreaker", "Headlamp or flashlight");
  }
  if (act.some((a) => a.includes("photo"))) {
    extras.push("Camera & spare batteries/memory cards");
  }
  if (act.some((a) => a.includes("beach"))) {
    extras.push("Swimwear", "Quick-dry towel", "Waterproof phone pouch");
  }
  if (act.some((a) => a.includes("culture") || a.includes("spiritual") || a.includes("heritage"))) {
    extras.push("Modest clothing for temples/religious sites (covered shoulders & knees)");
  }
  if (act.some((a) => a.includes("food"))) {
    extras.push("Antacids / digestive aid, just in case");
  }

  return [
    { category: "Essentials", items: essentials },
    { category: "Clothing", items: clothing },
    { category: "Travel Documents", items: documents },
    { category: "Extras for your trip", items: extras },
  ];
}
