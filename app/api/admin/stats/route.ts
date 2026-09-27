import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { query } from "@/lib/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [row] = await query<{
    destinations: string; attractions: string; users: string; reviews: string; favorites: string; itineraries: string;
  }>(`SELECT
    (SELECT COUNT(*) FROM "Destination") as destinations,
    (SELECT COUNT(*) FROM "Attraction") as attractions,
    (SELECT COUNT(*) FROM "User") as users,
    (SELECT COUNT(*) FROM "Review") as reviews,
    (SELECT COUNT(*) FROM "Favorite") as favorites,
    (SELECT COUNT(*) FROM "Itinerary") as itineraries
  `);

  return NextResponse.json({
    destinations: Number(row.destinations),
    attractions: Number(row.attractions),
    users: Number(row.users),
    reviews: Number(row.reviews),
    favorites: Number(row.favorites),
    itineraries: Number(row.itineraries),
  });
}
