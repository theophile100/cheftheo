interface CurrencyInfo {
  code: string;
  symbol: string;
  rateFromEur: number;
  exact?: boolean;
}

const EUR: CurrencyInfo = { code: "EUR", symbol: "€", rateFromEur: 1, exact: true };
// Franc CFA : parité fixe avec l'euro (1 EUR = 655,957 FCFA), pas une estimation.
const XOF: CurrencyInfo = { code: "XOF", symbol: "FCFA", rateFromEur: 655.957, exact: true };
const XAF: CurrencyInfo = { code: "XAF", symbol: "FCFA", rateFromEur: 655.957, exact: true };

// Taux indicatifs pour les autres monnaies (non connectés à un service de change
// en temps réel) — affichés avec le préfixe "≈" pour signaler l'approximation.
const COUNTRY_CURRENCY: Record<string, CurrencyInfo> = {
  // Zone franc CFA — Afrique de l'Ouest
  Bénin: XOF,
  "Burkina Faso": XOF,
  "Côte d'Ivoire": XOF,
  "Guinée-Bissau": XOF,
  Mali: XOF,
  Niger: XOF,
  Sénégal: XOF,
  Togo: XOF,
  // Zone franc CFA — Afrique centrale
  Cameroun: XAF,
  "Congo-Brazzaville": XAF,
  Gabon: XAF,
  "Guinée équatoriale": XAF,
  "République centrafricaine": XAF,
  Tchad: XAF,
  // Zone euro
  France: EUR,
  Belgique: EUR,
  Allemagne: EUR,
  Espagne: EUR,
  Italie: EUR,
  Portugal: EUR,
  "Pays-Bas": EUR,
  Irlande: EUR,
  Autriche: EUR,
  Finlande: EUR,
  Grèce: EUR,
  Luxembourg: EUR,
  Slovaquie: EUR,
  Slovénie: EUR,
  Estonie: EUR,
  Lettonie: EUR,
  Lituanie: EUR,
  Malte: EUR,
  Chypre: EUR,
  Monaco: EUR,
  Andorre: EUR,
  "Saint-Marin": EUR,
  Vatican: EUR,
  // Autres monnaies (taux approximatifs)
  Suisse: { code: "CHF", symbol: "CHF", rateFromEur: 0.94 },
  "Royaume-Uni": { code: "GBP", symbol: "£", rateFromEur: 0.84 },
  Canada: { code: "CAD", symbol: "$", rateFromEur: 1.47 },
  "États-Unis": { code: "USD", symbol: "$", rateFromEur: 1.06 },
  Maroc: { code: "MAD", symbol: "DH", rateFromEur: 10.9 },
  Tunisie: { code: "TND", symbol: "DT", rateFromEur: 3.3 },
  Algérie: { code: "DZD", symbol: "DA", rateFromEur: 145 },
  Nigeria: { code: "NGN", symbol: "₦", rateFromEur: 1750 },
  Ghana: { code: "GHS", symbol: "₵", rateFromEur: 15.5 },
  Kenya: { code: "KES", symbol: "KSh", rateFromEur: 140 },
  "Afrique du Sud": { code: "ZAR", symbol: "R", rateFromEur: 19.5 },
  Madagascar: { code: "MGA", symbol: "Ar", rateFromEur: 4900 },
};

const DEFAULT_CURRENCY = EUR;

export function formatPrice(priceEur: number, country?: string | null): string {
  const info = (country && COUNTRY_CURRENCY[country]) || DEFAULT_CURRENCY;
  const converted = priceEur * info.rateFromEur;
  const decimals = info.rateFromEur >= 100 ? 0 : 2;
  const rounded = Math.round(converted * 10 ** decimals) / 10 ** decimals;
  const formattedNumber = rounded.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = info.exact ? "" : "≈ ";
  return `${prefix}${formattedNumber} ${info.symbol}`;
}
