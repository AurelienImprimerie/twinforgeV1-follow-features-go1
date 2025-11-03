/**
 * Country Name to ISO Code Mapping
 * Maps full country names (as stored in user profile) to ISO 3166-1 alpha-2 codes
 * Used for geographic and weather data services
 */

export const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  // France et DOM-TOM
  'France': 'FR',
  'Guadeloupe': 'GP',
  'Martinique': 'MQ',
  'Guyane': 'GF',
  'Réunion': 'RE',
  'Mayotte': 'YT',
  'Saint-Pierre-et-Miquelon': 'PM',
  'Saint-Barthélemy': 'BL',
  'Saint-Martin': 'MF',
  'Wallis-et-Futuna': 'WF',
  'Polynésie française': 'PF',
  'Nouvelle-Calédonie': 'NC',

  // Pays francophones d'Europe
  'Belgique': 'BE',
  'Suisse': 'CH',
  'Luxembourg': 'LU',
  'Monaco': 'MC',

  // Pays francophones d'Afrique du Nord
  'Algérie': 'DZ',
  'Maroc': 'MA',
  'Tunisie': 'TN',

  // Pays francophones d'Afrique de l'Ouest
  'Sénégal': 'SN',
  'Côte d\'Ivoire': 'CI',
  'Mali': 'ML',
  'Bénin': 'BJ',
  'Niger': 'NE',
  'Burkina Faso': 'BF',
  'Togo': 'TG',
  'Guinée': 'GN',
  'Mauritanie': 'MR',

  // Pays francophones d'Afrique Centrale
  'Cameroun': 'CM',
  'Congo (RDC)': 'CD',
  'Congo': 'CG',
  'Gabon': 'GA',
  'Tchad': 'TD',
  'Centrafrique': 'CF',
  'Guinée équatoriale': 'GQ',

  // Pays francophones d'Afrique de l'Est
  'Rwanda': 'RW',
  'Burundi': 'BI',
  'Djibouti': 'DJ',

  // Pays francophones Océan Indien
  'Madagascar': 'MG',
  'Maurice': 'MU',
  'Seychelles': 'SC',
  'Comores': 'KM',

  // Pays francophones d'Amérique et Caraïbes
  'Canada': 'CA',
  'Haïti': 'HT',

  // Pays francophones d'Asie/Moyen-Orient
  'Liban': 'LB',
  'Viêt Nam': 'VN',
  'Cambodge': 'KH',
  'Laos': 'LA',

  // Pays francophones d'Océanie
  'Vanuatu': 'VU',

  // Pays anglophones majeurs
  'États-Unis': 'US',
  'Royaume-Uni': 'GB',
  'Australie': 'AU',
  'Nouvelle-Zélande': 'NZ',
  'Afrique du Sud': 'ZA',
  'Inde': 'IN',
  'Irlande': 'IE',
  'Jamaïque': 'JM',
  'Kenya': 'KE',
  'Nigéria': 'NG',
  'Singapour': 'SG',

  // Autres pays majeurs
  'Allemagne': 'DE',
  'Espagne': 'ES',
  'Italie': 'IT',
  'Portugal': 'PT',
  'Pays-Bas': 'NL',
  'Autriche': 'AT',
  'Grèce': 'GR',
  'Japon': 'JP',
  'Chine': 'CN',
  'Brésil': 'BR',
  'Mexique': 'MX',
  'Russie': 'RU',
  'Argentine': 'AR',
  'Chili': 'CL',
  'Colombie': 'CO',
  'Pérou': 'PE',
  'Égypte': 'EG',
  'Éthiopie': 'ET',
  'Ghana': 'GH',
  'Thaïlande': 'TH',
  'Malaisie': 'MY',
  'Indonésie': 'ID',
  'Philippines': 'PH',
  'Corée du Sud': 'KR',
  'Turquie': 'TR',
  'Arabie Saoudite': 'SA',
  'Émirats Arabes Unis': 'AE',
  'Israël': 'IL',
  'Pologne': 'PL',
  'République Tchèque': 'CZ',
  'Hongrie': 'HU',
  'Roumanie': 'RO',
  'Bulgarie': 'BG',
  'Suède': 'SE',
  'Norvège': 'NO',
  'Danemark': 'DK',
  'Finlande': 'FI',
};

/**
 * Get ISO code from country name
 */
export function getCountryISOCode(countryName: string | null | undefined): string | null {
  if (!countryName) return null;

  // Try exact match first
  const isoCode = COUNTRY_NAME_TO_ISO[countryName];
  if (isoCode) return isoCode;

  // Try case-insensitive match
  const normalizedName = countryName.trim();
  const entry = Object.entries(COUNTRY_NAME_TO_ISO).find(
    ([name]) => name.toLowerCase() === normalizedName.toLowerCase()
  );

  return entry ? entry[1] : null;
}

/**
 * Get country name from ISO code
 */
export function getCountryName(isoCode: string | null | undefined): string | null {
  if (!isoCode) return null;

  const entry = Object.entries(COUNTRY_NAME_TO_ISO).find(
    ([, code]) => code === isoCode.toUpperCase()
  );

  return entry ? entry[0] : null;
}

/**
 * Check if country is supported for geographic data
 */
export function isCountryNameSupported(countryName: string | null | undefined): boolean {
  return getCountryISOCode(countryName) !== null;
}
