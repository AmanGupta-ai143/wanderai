export type Phrase = {
  phrase: string;
  translation: string;
  phonetic: string;
};

export type LanguageGuide = {
  primary: string;
  alsoCommon: string[];
  phrases: Phrase[];
};

export type TransportOption = {
  mode: "Train" | "Flight" | "Bus" | "Car";
  from: string;
  approxTime: string;
  approxCost: string;
  detail: string;
};

export type WeatherForecastDay = {
  label: string;
  tempC: number;
  condition: "Sunny" | "Partly Cloudy" | "Cloudy" | "Rainy";
};

export type Weather = {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKmh: number;
  condition: WeatherForecastDay["condition"];
  forecast: WeatherForecastDay[];
};

export type MonthRating = {
  month: string;
  score: 0 | 1 | 2; // 0 = avoid, 1 = ok, 2 = best
  note: string;
};

export type Festival = {
  slug: string;
  name: string;
  dateLabel: string;
  image: string;
  description: string;
};

export type ShoppingItem = {
  category: string;
  item: string;
  image: string;
  priceRange: string;
  whereToBuy: string;
  bargainingTip: string;
};

export type SafetyInfo = {
  emergency: { police: string; ambulance: string; fire: string };
  tips: string[];
};

export type QuickFacts = {
  weather: string;
  budget: string;
  language: string;
  stay: string;
};

export type Attraction = {
  slug: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  duration: string;
  ticket: string;
  hours: string;
  bestTime: string;
  about: string;
  architecture: string;
  location: string;
  lat: number;
  lng: number;
};

export type Hotel = {
  slug: string;
  name: string;
  tier: "Budget" | "Mid-range" | "Luxury";
  pricePerNight: number;
  rating: number;
  image: string;
  lat: number;
  lng: number;
};

export type Restaurant = {
  slug: string;
  name: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  image: string;
  lat: number;
  lng: number;
};

export type HistoryEvent = {
  year: string;
  title: string;
  description: string;
};

export type CultureItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
};

export type FoodItem = {
  slug: string;
  name: string;
  origin: string;
  image: string;
  description: string;
  ingredients: string[];
  taste: string;
  significance: string;
  whereToTry: string;
};

export type GalleryImage = {
  image: string;
  category: string;
  caption: string;
  tall?: boolean;
};

export type Destination = {
  slug: string;
  name: string;
  tagline: string;
  region: string;
  country: string;
  rating: number;
  heroImage: string;
  cardImage: string;
  tags: string[];
  bestTime: string;
  quickFacts: QuickFacts;
  intro: string;
  didYouKnow: string[];
  center: { lat: number; lng: number };
  attractions: Attraction[];
  history: HistoryEvent[];
  culture: CultureItem[];
  food: FoodItem[];
  gallery: GalleryImage[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  languageGuide: LanguageGuide;
  transport: TransportOption[];
  weather: Weather;
  bestTimeCalendar: MonthRating[];
  festivals: Festival[];
  shopping: ShoppingItem[];
  safety: SafetyInfo;
};
