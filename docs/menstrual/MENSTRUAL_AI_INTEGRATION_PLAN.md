# Plan d'Intégration AI des Données Menstruelles

**Date**: 2025-11-04
**Statut**: Proposition
**Priorité**: Haute

## Vue d'Ensemble

Ce document détaille le plan d'intégration des données de cycle menstruel dans les différentes forges TwinForge pour fournir des insights et recommandations personnalisées basées sur les phases hormonales.

## Données Disponibles

### Table: `menstrual_cycles`

```sql
- user_id: UUID (FK vers auth.users)
- cycle_start_date: DATE (date des dernières règles)
- cycle_length: INTEGER (21-45 jours, défaut: 28)
- period_duration: INTEGER (2-10 jours, défaut: 5)
- cycle_regularity: ENUM ('regular', 'irregular', 'very_irregular')
```

### Calculs Dérivés Disponibles

- **Phase actuelle du cycle** (via CurrentCycleInfoCard):
  - Menstruation (J1-J5)
  - Phase Folliculaire (J6 à ovulation-2j)
  - Ovulation (ovulation-2j à ovulation+2j)
  - Phase Lutéale (post-ovulation jusqu'au prochain cycle)

- **Jour du cycle actuel**: Calculé à partir de `cycle_start_date`
- **Prochaines règles estimées**: Basé sur `cycle_length`

## Intégrations Prioritaires

### 1. Forge Nutritionnelle (nutrition-trend-analysis)

**Fichier**: `supabase/functions/nutrition-trend-analysis/index.ts`

#### Améliorations Proposées

**A. Enrichissement du Contexte Profile**

Ajouter une fonction pour récupérer les données menstruelles:

```typescript
async function getMenstrualContext(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('menstrual_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('cycle_start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const today = new Date();
  const lastPeriod = new Date(data.cycle_start_date);
  const dayInCycle = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ovulationDay = Math.floor(data.cycle_length / 2);

  let phase = 'unknown';
  if (dayInCycle <= 5) phase = 'menstruation';
  else if (dayInCycle < ovulationDay - 2) phase = 'follicular';
  else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) phase = 'ovulation';
  else phase = 'luteal';

  return {
    currentPhase: phase,
    dayInCycle,
    cycleLength: data.cycle_length,
    cycleRegularity: data.cycle_regularity,
    daysUntilNextPeriod: data.cycle_length - dayInCycle,
  };
}
```

**B. Enrichissement du Prompt AI**

Ajouter au contexte envoyé à GPT-4:

```typescript
const menstrualContext = await getMenstrualContext(userId, supabase);

if (menstrualContext) {
  prompt += `\n\n## CYCLE MENSTRUEL

Phase actuelle: ${menstrualContext.currentPhase}
Jour du cycle: J${menstrualContext.dayInCycle}/${menstrualContext.cycleLength}
Régularité: ${menstrualContext.cycleRegularity}
Prochaines règles dans: ${menstrualContext.daysUntilNextPeriod} jours

CONSIDÉRATIONS HORMONALES PAR PHASE:

**Menstruation (J1-J5)**:
- Besoins accrus: Fer, vitamine C, magnésium
- Hydratation importante
- Éviter aliments pro-inflammatoires
- Calories légèrement augmentées si besoin

**Phase Folliculaire (J6-J${menstrualContext.cycleLength/2-2})**:
- Énergie croissante
- Métabolisme optimal
- Bon moment pour déficit calorique si objectif perte de poids
- Favoriser glucides complexes pré-entraînement

**Ovulation (J${menstrualContext.cycleLength/2-2}-J${menstrualContext.cycleLength/2+2})**:
- Pic d'énergie
- Métabolisme et sensibilité insuline optimaux
- Performances nutritionnelles maximales
- Bon timing pour repas plus riches en glucides

**Phase Lutéale (J${menstrualContext.cycleLength/2+3}-J${menstrualContext.cycleLength})**:
- Métabolisme ralentit
- Rétention d'eau possible
- Augmenter fibres et magnésium
- Gérer envies sucrées avec alternatives saines
- Légère augmentation calorique naturelle (50-100 kcal)

Adapte tes recommandations nutritionnelles à la phase actuelle.`;
}
```

**Résultat Attendu**:
- Recommandations alimentaires adaptées à la phase hormonale
- Explication des variations de poids/énergie
- Conseils d'hydratation et de supplémentation ciblés

---

### 2. Forge Temporelle (fasting-insights-generator)

**Fichier**: `supabase/functions/fasting-insights-generator/index.ts`

#### Améliorations Proposées

**A. Adaptation des Protocoles de Jeûne**

```typescript
const menstrualContext = await getMenstrualContext(userId, supabase);

if (menstrualContext) {
  prompt += `\n\n## ADAPTATION AU CYCLE MENSTRUEL

Phase actuelle: ${menstrualContext.currentPhase} (J${menstrualContext.dayInCycle})

RECOMMANDATIONS TEMPORELLES PAR PHASE:

**Menstruation (J1-J5)**:
- Jeûne plus court recommandé (12-14h)
- Flexibilité importante
- Priorité à l'écoute du corps
- Autoriser breaking du jeûne si fatigue intense

**Phase Folliculaire (J6-J${menstrualContext.cycleLength/2-2})**:
- Phase optimale pour jeûnes prolongés (16-18h)
- Meilleure tolérance hormonale
- Métabolisme favorable
- Bon timing pour OMAD si pratiqué

**Ovulation (J${menstrualContext.cycleLength/2-2}-J${menstrualContext.cycleLength/2+2})**:
- Excellente adaptation métabolique
- Jeûnes standards très bien tolérés
- Performance énergétique optimale

**Phase Lutéale (J${menstrualContext.cycleLength/2+3}-J${menstrualContext.cycleLength})**:
- Raccourcir légèrement la fenêtre de jeûne (-1 à -2h)
- Sensibilité accrue à l'hypoglycémie
- Priorité au confort
- Accepter variation naturelle de performance

Adapte ta stratégie de jeûne et insights en fonction de la phase actuelle.`;
}
```

**Résultat Attendu**:
- Protocoles de jeûne adaptés à la phase cyclique
- Explication des variations de tolérance au jeûne
- Conseils de flexibilité temporelle

---

### 3. Forge Énergétique (activity-progress-generator)

**Fichier**: `supabase/functions/activity-progress-generator/index.ts`

#### Améliorations Proposées

**A. Optimisation de la Périodisation d'Entraînement**

```typescript
const menstrualContext = await getMenstrualContext(userId, supabase);

if (menstrualContext) {
  prompt += `\n\n## CYCLE MENSTRUEL ET ENTRAÎNEMENT

Phase actuelle: ${menstrualContext.currentPhase} (J${menstrualContext.dayInCycle})

OPTIMISATION PAR PHASE:

**Menstruation (J1-J5)**:
- Intensité modérée privilégiée
- Focus récupération active
- Yoga, stretching, cardio léger
- Réduire volume si fatigue
- OK pour repos complet si nécessaire

**Phase Folliculaire (J6-J${menstrualContext.cycleLength/2-2})**:
- Phase anabolique optimale
- Meilleur moment pour PRs en force
- Tolérance volume/intensité élevée
- Progression rapide possible
- Focus: Force, puissance, hypertrophie

**Ovulation (J${menstrualContext.cycleLength/2-2}-J${menstrualContext.cycleLength/2+2})**:
- Pic de performance attendu
- Coordination neuromusculaire optimale
- Excellent timing pour tests de performance
- Force maximale accessible

**Phase Lutéale (J${menstrualContext.cycleLength/2+3}-J${menstrualContext.cycleLength})**:
- Maintien plutôt que progression
- Récupération prioritaire
- Bon pour endurance/cardio modéré
- Éviter PRs en fin de phase
- Augmenter temps de récupération (+20-30%)

Adapte la périodisation et l'intensité conseillée selon la phase actuelle.`;
}
```

**Résultat Attendu**:
- Programme d'entraînement cyclique adapté
- Explication des variations de performance
- Périodisation intelligente

---

### 4. Forge Culinaire (meal-plan-generator)

**Fichier**: `supabase/functions/meal-plan-generator/index.ts`

#### Améliorations Proposées

**A. Plans de Repas Cycliques**

```typescript
const menstrualContext = await getMenstrualContext(userId, supabase);

if (menstrualContext) {
  prompt += `\n\n## BESOINS NUTRITIONNELS CYCLIQUES

Phase actuelle: ${menstrualContext.currentPhase} (J${menstrualContext.dayInCycle})

AJUSTEMENTS PAR PHASE:

**Menstruation**:
- Aliments riches en fer: viandes rouges, lentilles, épinards
- Vitamine C pour absorption fer: agrumes, poivrons
- Magnésium anti-crampes: chocolat noir, bananes, amandes
- Oméga-3 anti-inflammatoires: poissons gras, noix
- Hydratation tisanes: gingembre, camomille

**Phase Folliculaire**:
- Protéines maigres pour reconstruction
- Glucides complexes pour énergie stable
- Légumes crucifères (métabolisme oestrogènes)
- Graines de lin, potiron (phytoestrogènes)

**Ovulation**:
- Antioxydants: baies, légumes colorés
- Fibres pour régulation hormonale
- Zinc: fruits de mer, graines de courge
- Maintenir équilibre optimal

**Phase Lutéale**:
- Glucides complexes (sérotonine)
- Magnésium (chocolat noir, avocats)
- Vitamine B6 (poulet, patates douces)
- Calcium (produits laitiers, alternatives)
- Limiter sel (rétention d'eau)
- Alternatives saines aux envies sucrées

Génère un plan de repas adapté à la phase actuelle avec ces priorités nutritionnelles.`;
}
```

**Résultat Attendu**:
- Menus hebdomadaires adaptés à la phase
- Recettes ciblant les besoins hormonaux
- Liste de courses optimisée

---

### 5. Central Brain (Head System)

**Fichiers**: `src/system/head/knowledge/collectors/*.ts`

#### Améliorations Proposées

**A. Nouveau Collector: MenstrualDataCollector**

Créer `src/system/head/knowledge/collectors/MenstrualDataCollector.ts`:

```typescript
import { supabase } from '../../../supabase/client';

export interface MenstrualPhaseData {
  currentPhase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | null;
  dayInCycle: number | null;
  cycleLength: number;
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
  daysUntilNextPeriod: number | null;
  energyLevel: 'low' | 'moderate' | 'high' | 'peak';
  metabolicRate: 'reduced' | 'normal' | 'elevated';
}

export async function collectMenstrualData(userId: string): Promise<MenstrualPhaseData | null> {
  const { data, error } = await supabase
    .from('menstrual_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('cycle_start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const today = new Date();
  const lastPeriod = new Date(data.cycle_start_date);
  const dayInCycle = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ovulationDay = Math.floor(data.cycle_length / 2);

  let phase: MenstrualPhaseData['currentPhase'] = null;
  let energyLevel: MenstrualPhaseData['energyLevel'] = 'moderate';
  let metabolicRate: MenstrualPhaseData['metabolicRate'] = 'normal';

  if (dayInCycle <= 5) {
    phase = 'menstruation';
    energyLevel = 'low';
    metabolicRate = 'reduced';
  } else if (dayInCycle < ovulationDay - 2) {
    phase = 'follicular';
    energyLevel = 'high';
    metabolicRate = 'elevated';
  } else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
    phase = 'ovulation';
    energyLevel = 'peak';
    metabolicRate = 'elevated';
  } else {
    phase = 'luteal';
    energyLevel = dayInCycle < data.cycle_length - 5 ? 'moderate' : 'low';
    metabolicRate = 'reduced';
  }

  return {
    currentPhase: phase,
    dayInCycle,
    cycleLength: data.cycle_length,
    cycleRegularity: data.cycle_regularity,
    daysUntilNextPeriod: data.cycle_length - dayInCycle,
    energyLevel,
    metabolicRate,
  };
}
```

**B. Intégration dans UserKnowledgeBase**

Mettre à jour `src/system/head/knowledge/UserKnowledgeBase.ts`:

```typescript
import { collectMenstrualData } from './collectors/MenstrualDataCollector';

// Dans la méthode buildKnowledge():
const menstrualData = await collectMenstrualData(this.userId);

if (menstrualData) {
  knowledge.menstrualPhase = menstrualData;

  // Ajouter aux insights contextuels
  knowledge.contextualInsights.push({
    category: 'hormonal',
    priority: 'high',
    message: this.getMenstrualPhaseInsight(menstrualData),
  });
}

private getMenstrualPhaseInsight(data: MenstrualPhaseData): string {
  const phaseMessages = {
    menstruation: `Vous êtes en phase menstruelle (J${data.dayInCycle}). Privilégiez le repos et une alimentation riche en fer.`,
    follicular: `Phase folliculaire (J${data.dayInCycle}) - période optimale pour la performance et la progression!`,
    ovulation: `Pic d'ovulation (J${data.dayInCycle}) - votre potentiel est à son maximum.`,
    luteal: `Phase lutéale (J${data.dayInCycle}) - maintenez vos acquis, prochaines règles dans ${data.daysUntilNextPeriod} jours.`,
  };

  return phaseMessages[data.currentPhase!] || '';
}
```

---

## Implémentation Progressive

### Phase 1: Fondations (Priorité Immédiate)
- ✅ Structure de l'onglet Menstruel créée
- ✅ Composants UI avec progression rose
- ✅ Sauvegarde automatique intégrée
- ⏳ Création du MenstrualDataCollector
- ⏳ Fonction helper partagée `getMenstrualContext()`

### Phase 2: Intégration Forge Nutritionnelle (Semaine 1)
- Enrichir `nutrition-trend-analysis` avec contexte menstruel
- Tester recommandations par phase
- Valider avec utilisatrices beta

### Phase 3: Intégration Forge Temporelle (Semaine 2)
- Adapter `fasting-insights-generator`
- Protocoles de jeûne cycliques
- Validation terrain

### Phase 4: Intégration Forge Énergétique (Semaine 3)
- Périodisation dans `activity-progress-generator`
- Ajustements intensité/volume
- Tests de performance par phase

### Phase 5: Intégration Complete (Semaine 4)
- `meal-plan-generator` avec menus cycliques
- Central Brain avec insights proactifs
- Dashboard de suivi cycle dans Forge Corporelle

---

## Métriques de Succès

### Adoption
- % d'utilisatrices ayant rempli les données de cycle
- Fréquence de mise à jour des données

### Engagement
- Ouverture des insights menstruels
- Interactions avec recommandations adaptées

### Satisfaction
- Feedback utilisatrices sur pertinence
- NPS spécifique à la fonctionnalité cycle

### Rétention
- Impact sur rétention globale
- Utilisation long-terme des forges enrichies

---

## Considérations Techniques

### Base de Données
- Aucune migration nécessaire (table `menstrual_cycles` existe)
- Ajouter index sur `user_id, cycle_start_date` si non présent

### Performance
- Cache des calculs de phase (1h de validité)
- Calculs légers côté client pour UI
- Appels API mensuels uniquement pour insights longs

### Sécurité & Privacy
- Données hautement sensibles
- RLS strict (existant)
- Chiffrement au repos
- Aucun partage externe
- Logs anonymisés

---

## Ressources & Documentation

### Références Scientifiques
- Impact du cycle menstruel sur le métabolisme: [Étude 2024]
- Périodisation de l'entraînement cyclique: [Étude 2023]
- Besoins nutritionnels par phase: [Méta-analyse 2024]

### Code Examples
- Voir `CurrentCycleInfoCard.tsx` pour logique de phases
- Pattern de collecteur: `BodyScanDataCollector.ts`

---

**Auteur**: AI Assistant
**Reviewers**: Product Team, Data Science Team
**Approbation**: Pending

---

## Notes de Mise en Œuvre

Ce plan respecte les principes suivants:
1. **Non-régression**: Intégrations progressives et testées
2. **Privacy First**: Données sensibles protégées
3. **Value-Driven**: Chaque intégration apporte une valeur concrète
4. **User-Centric**: Focus sur l'expérience utilisatrice
5. **Scientific**: Basé sur la recherche hormonale moderne
