export function formatFRW(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " FRW";
}

export const CATEGORIES = [
  "Wall Arts",
  "Gifts & Wishes",
  "Kids",
  "Signages",
  "Word of God",
  "Others",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const WHATSAPP_NUMBER = "250791446645"; // international format, no +
