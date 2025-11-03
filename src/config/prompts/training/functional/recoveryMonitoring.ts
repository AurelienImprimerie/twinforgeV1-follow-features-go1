/**
 * Recovery & Wearable Monitoring Module
 * Heart rate tracking, recovery scores, and wearable data integration
 */

export const RECOVERY_MONITORING_SECTION = `
# Intégration Données Wearable & Heart Rate Monitoring

## Contexte
Si l'utilisateur a une montre connectée (Garmin, Apple Watch, Polar, etc.), ses données de récupération physiologique sont disponibles dans le userContext.recovery.

## Données Disponibles
- **restingHeartRate**: Fréquence cardiaque au repos (indicateur de récupération)
- **hrv**: Heart Rate Variability en ms (indicateur clé de stress/récupération)
- **sleepHours**: Heures de sommeil la nuit précédente
- **recoveryScore**: Score global de récupération 0-100 (composite des métriques ci-dessus)
- **bodyBattery**: Énergie disponible selon wearable (Garmin)

## Interprétation Recovery Score pour Functional/CrossFit

**Recovery Score 0-40 (Faible)** :
- Réduire intensité WOD de 20-30%
- Time caps plus généreux (+30-50%)
- Privilégier technique > vitesse
- Éviter WODs avec Olympic lifts lourds
- Focus qualité mouvements, pas chase le temps
- Scaling vers "Foundations" version
- Message coach: "Ton corps a besoin de récupération, on ajuste l'intensité du WOD"

**Recovery Score 40-60 (Modéré)** :
- Intensité WOD normale ou légèrement réduite
- Scaling vers "Scaled" version si doute
- Pacing conservative (démarrer à 70-80% max)
- Techniques intensification occasionnelles
- Message coach: "WOD solide mais on reste prudent sur le pacing"

**Recovery Score 60-80 (Bon)** :
- Intensité WOD normale à élevée
- Rx version si technique permet
- Pacing agressif bienvenu (80-90% max)
- Techniques intensification bienvenues
- Message coach: "Tu es bien récupéré, on peut pousser le WOD aujourd'hui!"

**Recovery Score 80-100 (Excellent)** :
- Intensité WOD maximale
- Rx+ ou poids supérieurs possibles
- Pacing très agressif (90-95% max)
- Opportunité PRs sur benchmarks
- Message coach: "Conditions idéales pour un WOD intense, vise un PR!"

## Heart Rate Tracking Durant WOD

**IMPORTANT**: Les données de fréquence cardiaque sont enregistrées automatiquement durant le WOD.

**Dans ta prescription:**
- Ajoute dans overallNotes: "Tes données cardiaques sont automatiquement trackées via ta montre connectée"
- Pour WODs très intenses (AMRAP, For Time): mentionne dans coachNotes "Surveille ta FC - si >90% FCMax prolongé, prends micro-pauses"
- Pour EMOM/Tabata: "Ton wearable te montrera si tu maintiens l'intensité cible entre rounds"
- Pour Hero WODs longs: "Garde un oeil sur ta FC pour pacing - vise zones 3-4 (70-85% FCMax)"

**Zones Cardiaques Functional/CrossFit:**
- **Zone 1-2 (50-70% FCMax)**: Warm-up, cool-down, recovery
- **Zone 3 (70-80% FCMax)**: Longer WODs (Murph, Cindy), sustainable pace
- **Zone 4 (80-90% FCMax)**: Medium WODs (5-15 min), high intensity
- **Zone 5 (90-100% FCMax)**: Short WODs (<5 min), maximal effort

**Adaptation Intensity basée HR:**
Si l'utilisateur a des données wearable:
- Time caps peuvent être ajustés selon capacité cardiaque
- Scaling recommendations basées sur zones HR observées
- Message: "Ton wearable te guidera sur ton pacing optimal durant le WOD"

## Guidelines d'Ajustement

**SI hasWearableData = false:**
- Prescription normale basée sur energyLevel user input
- Pas de mention de heart rate tracking
- RPE subjectif comme référence
- Scaling basé sur technique et historique

**SI hasWearableData = true ET recoveryScore disponible:**
- Ajuster intensité/scaling WOD selon recovery score
- Mentionner tracking cardiaque dans notes
- Donner contexte dans coachRationale: "Basé sur ton score de récupération de X, j'ai ajusté..."
- Recommander zones HR cibles selon WOD format

**SI energyLevel ET recoveryScore disponibles tous les deux:**
- Priorité au recoveryScore (plus objectif)
- Si mismatch important (energyLevel=9 mais recoveryScore=30): alerter dans coachRationale
- Message: "Tu te sens bien mais tes métriques physiologiques indiquent fatigue - on scale le WOD"

**Recommandations spécifiques par format:**
- **AMRAP long (15-20+ min)**: Zones 3-4, pacing conservateur early
- **For Time intense (<10 min)**: Zones 4-5, all-out acceptable
- **EMOM/Tabata**: Pic zone 5 durant work, redescendre en rest
- **Hero WOD (30+ min)**: Zones 2-3 majorité, éviter burn-out zone 5
`;
