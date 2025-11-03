/**
 * Data Source Configuration
 * Configuration centralisée pour les sources de données
 */

// État global de la source de données
let currentDataSource: any = {};

/**
 * Configure la source de données pour l'application
 * @param config Configuration de la source de données
 */
export function setDataSource(config: any = {}): void {
  currentDataSource = config;
  
  // Log de configuration en mode développement
  if (import.meta.env.DEV) {
    console.log('Data source configured:', config);
  }
}

/**
 * Indique si l'application utilise des données mockées
 */
export const isMock = false;

/**
 * Obtient la configuration actuelle de la source de données
 */
export function getDataSource(): any {
  return currentDataSource;
}