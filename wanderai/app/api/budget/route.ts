import { NextRequest, NextResponse } from "next/server";

type Style = "budget" | "standard" | "luxury";

const STYLE_MULTIPLIER: Record<Style, number> = { budget: 0.6, standard: 1, luxury: 2 };
const ACCOMMODATION_PER_NIGHT: Record<Style, number> = {
  budget: 1400,
  standard: 2400,
  luxury: 6000,
};

const BASE = {
  transportPerPerson: 3000,
  foodPerPersonPerDay: 600,
  activitiesPerDay: 625,
  localTransportPerDay: 500,
};

function isStyle(v: unknown): v is Style {
  return v === "budget" || v === "standard" || v === "luxury";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const people = Number(body?.people) || 1;
  const days = Number(body?.days) || 1;
  const travelStyle: Style = isStyle(body?.travelStyle) ? body.travelStyle : "standard";
  const accommodationStyle: Style = isStyle(body?.accommodationStyle)
    ? body.accommodationStyle
    : "standard";

  if (people < 1 || days < 1) {
    return NextResponse.json({ error: "people and days must be at least 1" }, { status: 400 });
  }

  const styleMult = STYLE_MULTIPLIER[travelStyle];

  const breakdown = {
    transportation: Math.round(BASE.transportPerPerson * people * styleMult),
    accommodation: Math.round(ACCOMMODATION_PER_NIGHT[accommodationStyle] * days),
    food: Math.round(BASE.foodPerPersonPerDay * people * days * styleMult),
    activities: Math.round(BASE.activitiesPerDay * days * styleMult),
    localTransport: Math.round(BASE.localTransportPerDay * days * styleMult),
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    breakdown,
    total,
    perPerson: Math.round(total / people),
    inputs: { people, days, travelStyle, accommodationStyle },
  });
}
