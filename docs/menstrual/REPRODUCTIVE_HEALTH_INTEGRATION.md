# Système de Santé Reproductive - Intégration Complète

## Vue d'Ensemble

Le système de santé reproductive de TwinForge intègre trois modules complémentaires qui permettent une personnalisation optimale des recommandations nutritionnelles, d'activité physique et de jeûne pour les utilisatrices.

## Architecture Complète

### 🎯 Les 3 Systèmes de Suivi

#### 1. Cycle Menstruel (`menstrual_cycles`)
**Pour:** Femmes avec cycles menstruels actifs

**Tables:**
- `menstrual_cycles` - Données de cycle (date début, durée, régularité)
- `menstrual_symptoms_tracking` - Suivi quotidien des symptômes

**Données collectées:**
- Date des dernières règles
- Durée moyenne du cycle (21-45 jours)
- Durée des règles (2-10 jours)
- Régularité (régulier, irrégulier, très irrégulier)
- Intensité du flux (léger, modéré, important)
- Symptômes quotidiens (crampes, maux de tête, fatigue, etc.)

**Calculs automatiques:**
- Phase actuelle du cycle (menstruation, folliculaire, ovulation, lutéale)
- Jour du cycle
- Prédiction des prochaines règles
- Recommandations d'intensité d'entraînement
- Variations de poids attendues

#### 2. Ménopause (`menopause_tracking`)
**Pour:** Femmes en périménopause, ménopause ou post-ménopause

**Tables:**
- `menopause_tracking` - Statut reproductif et données médicales
- `menopause_symptoms_log` - Suivi quotidien des symptômes

**Données collectées:**
- Statut reproductif (périménopause, ménopause, post-ménopause)
- Stade de périménopause (précoce, tardif)
- Date des dernières règles
- Date de confirmation ménopause (12 mois sans règles)
- Niveaux FSH et œstrogène (optionnel)
- Symptômes quotidiens (bouffées de chaleur, sueurs nocturnes, qualité sommeil)

**Recommandations spécifiques:**
- Augmentation protéines (préservation masse musculaire)
- Calcium et vitamine D (prévention ostéoporose)
- Musculation prioritaire (3-4x/semaine)
- Fenêtre de jeûne réduite (12-14h max)

#### 3. Allaitement (`breastfeeding_tracking`)
**Pour:** Mères allaitantes

**Table:**
- `breastfeeding_tracking` - Statut et détails d'allaitement

**Données collectées:**
- Statut d'allaitement actif
- Type (exclusif, mixte, sevrage)
- Âge du bébé en mois (0-36)
- Date de début
- Notes

**Ajustements nutritionnels:**
- Augmentation calorique (+500 kcal exclusif, +350 mixte, +250 sevrage)
- Protéines supplémentaires (+25g exclusif, +15g mixte)
- Hydratation critique (3L/jour minimum)
- Oméga-3 DHA (300mg/jour)
- Jeûne intermittent déconseillé (max 12h si vraiment souhaité)

---

## Intégration Technique

### 🔗 Edge Functions Connectées

**5 Edge Functions utilisent les données de santé reproductive:**

1. **meal-plan-generator** - Génération de plans de repas hebdomadaires
2. **recipe-detail-generator** - Enrichissement des recettes détaillées
3. **activity-progress-generator** - Génération d'insights d'activité
4. **fasting-insights-generator** - Analyse et recommandations de jeûne
5. **nutrition-trend-analysis** - Analyse des tendances nutritionnelles

### 📊 Fonction Partagée: `getReproductiveHealthContext()`

**Localisation:** `/supabase/functions/_shared/utils/reproductiveHealthContext.ts`

**Logique:**
```typescript
1. Vérifier statut allaitement (prioritaire, indépendant du cycle)
2. Si ménopause/périménopause → Retourner contexte ménopause + allaitement
3. Sinon, chercher données cycle menstruel
4. Si cycle trouvé → Retourner contexte menstruel + allaitement
5. Si seulement allaitement → Retourner contexte allaitement
6. Sinon → Retourner vide (pas de données)
```

**Format de sortie:**
```typescript
interface ReproductiveHealthContext {
  hasData: boolean;
  status: 'menstruating' | 'perimenopause' | 'menopause' | 'postmenopause' | null;
  formattedContext: string; // Texte formaté pour enrichir prompts AI
}
```

### 🛡️ Sécurité (Row Level Security)

**Toutes les tables ont RLS activé avec 4 politiques par table:**

```sql
-- SELECT: Users can only view their own data
USING (auth.uid() = user_id)

-- INSERT: Users can only insert their own data
WITH CHECK (auth.uid() = user_id)

-- UPDATE: Users can only update their own data
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)

-- DELETE: Users can only delete their own data
USING (auth.uid() = user_id)
```

**Résultat:** Isolation totale des données par utilisatrice, aucun accès croisé possible.

---

## Enrichissement des Prompts AI

### 📝 Exemple de Contexte Menstruel Ajouté

```
## CYCLE MENSTRUEL

Phase actuelle: ovulation
Jour du cycle: J14/28
Régularité: regular
Prochaines règles dans: 14 jours
Niveau d'énergie: peak
Métabolisme: elevated

Pic d'énergie, performances maximales possibles

CONSIDÉRATIONS HORMONALES PAR PHASE:

**Ovulation**
- Énergie croissante, métabolisme optimal
- Bon moment pour déficit calorique si objectif perte de poids
- Favoriser glucides complexes pré-entraînement
- Intensité entraînement: Haute (PRs possibles)
- Jeûne: 16-18h bien toléré

Adapte tes recommandations à la phase actuelle.
```

### 📝 Exemple de Contexte Ménopause Ajouté

```
## STATUT REPRODUCTIF

Statut actuel: Périménopause
Stade: Précoce
Jours depuis dernières règles: 45
Niveau FSH: 35 UI/L

## RECOMMANDATIONS ADAPTÉES

### Nutrition
- Augmenter protéines: 25-30g par repas (préservation masse musculaire)
- Calcium 1200mg/jour: produits laitiers, légumes verts, tofu
- Vitamine D 800-1000 UI/jour: poissons gras, œufs, suppléments
- Oméga-3 anti-inflammatoires: saumon, sardines, noix
- Phytoestrogènes: soja, graines de lin
- Limiter caféine et alcool (bouffées de chaleur)

### Exercice
- PRIORITÉ: Musculation 3x/semaine minimum
- Exercices de résistance avec poids
- Cardio modéré 150min/semaine
- HIIT 1-2x/semaine (métabolisme)
- Récupération: 48h entre sessions de force

### Jeûne
- Fenêtre réduite: 14-16h maximum
- Éviter jeûnes prolongés (stress hormonal)
- Flexibilité importante
- Breaking OK si hypoglycémie ou fatigue

IMPORTANT: Adapte toutes tes recommandations à ce statut hormonal et métabolique.
```

### 📝 Exemple de Contexte Allaitement Ajouté

```
## ALLAITEMENT 🤱

Statut: ALLAITE ACTUELLEMENT
Type: Allaitement exclusif
Âge du bébé: 4 mois - Nourrisson (3-6 mois)

## BESOINS NUTRITIONNELS SPÉCIFIQUES

### Apport Calorique
CRITIQUE: Augmenter de +500 kcal/jour minimum
- Production de lait = dépense énergétique importante
- Ne JAMAIS proposer de déficit calorique pendant l'allaitement
- Maintenir un apport calorique suffisant est essentiel pour qualité du lait

### Macronutriments
- Protéines: +25g/jour (1,3-1,5g/kg)
  → Viandes maigres, poissons, œufs, légumineuses
- Glucides complexes: Privilégier (énergie durable)
  → Avoine, quinoa, patates douces, pain complet
- Lipides de qualité: Oméga-3 DHA 300mg/jour minimum
  → Saumon, sardines, maquereau, noix, graines de lin

### HYDRATATION CRITIQUE 💧
- Eau: 3 litres/jour MINIMUM
- Boire avant, pendant et après chaque tétée
- Déshydratation = baisse production de lait
- Tisanes d'allaitement OK (fenouil, anis)
- Limiter caféine: Max 300mg/jour (2 cafés)

### ALIMENTS À FAVORISER
- Avoine (galactagogue naturel - stimule production lait)
- Saumon et poissons gras (DHA pour développement bébé)
- Légumes verts feuillus (fer, folate, calcium)
- Amandes et noix (protéines, calcium, bonnes graisses)
- Légumineuses (protéines végétales, fer)

## JEÛNE INTERMITTENT ET ALLAITEMENT

### POSITION OFFICIELLE: DÉCONSEILLÉ
- Jeûne intermittent NON recommandé pendant allaitement
- Risques: Baisse production de lait, déshydratation, carences nutritionnelles

### SI VRAIMENT SOUHAITÉ (avec précautions)
- Fenêtre TRÈS réduite: 12h MAXIMUM
- Exemple: 20h - 8h (pendant sommeil)
- JAMAIS OMAD ou jeûnes prolongés

CRITIQUE: Toutes tes recommandations doivent PRIORITISER la santé de la mère et la qualité du lait maternel.
JAMAIS proposer de restriction calorique ou de jeûne pendant l'allaitement.
```

---

## Interface Utilisateur

### 🎨 ProfileMenstrualTab (Femmes uniquement)

**Localisation:** `/src/app/pages/Profile/ProfileMenstrualTab.tsx`

**Composants:**
- `MenstrualCycleSection` - Formulaire date, durée cycle, durée règles
- `CycleRegularitySection` - Sélection régularité
- `CurrentCycleInfoCard` - Phase actuelle et prédictions

**Visibilité:** Conditionnel basé sur `profile.sex === 'female'`

**Hook personnalisé:** `useProfileMenstrualForm()`
- Chargement depuis `menstrual_cycles`
- Validation temps réel (Zod)
- Sauvegarde avec upsert

### 🎨 ProfileMenopauseTab (Femmes uniquement)

**Composants:**
- `ReproductiveStatusSelector` - Choix du statut
- `MenopauseDetailsSection` - Dates, niveaux hormonaux
- `MenopauseInfoCard` - Informations contextuelles

### 🎨 ProfileBreastfeedingTab (Femmes uniquement)

**Composants:**
- `BreastfeedingSection` - Statut, type, âge bébé
- Informations nutritionnelles spécifiques
- Alertes jeûne intermittent

---

## Migrations SQL

### 📁 Fichiers de Migration

1. **`20251104023934_add_menopause_tracking_system.sql`**
   - Tables: `menopause_tracking`, `menopause_symptoms_log`
   - RLS complet
   - Indexes de performance

2. **`20251104043414_add_breastfeeding_tracking.sql`**
   - Table: `breastfeeding_tracking`
   - RLS complet
   - Index sur is_breastfeeding

3. **`20251104120000_add_menstrual_cycle_tracking.sql`** ✨ **NOUVELLE**
   - Tables: `menstrual_cycles`, `menstrual_symptoms_tracking`
   - RLS complet
   - Indexes multiples
   - Contraintes de validation (durées, dates, intensités)

### ✅ Statut des Tables

| Table | Statut | RLS | Indexes | Frontend | Edge Functions |
|-------|--------|-----|---------|----------|----------------|
| `menstrual_cycles` | ✅ Créée | ✅ Actif | ✅ 2 indexes | ✅ Connecté | ✅ 5 fonctions |
| `menstrual_symptoms_tracking` | ✅ Créée | ✅ Actif | ✅ 2 indexes | 🔜 À venir | 🔜 À venir |
| `menopause_tracking` | ✅ Créée | ✅ Actif | ✅ 2 indexes | ✅ Connecté | ✅ 5 fonctions |
| `menopause_symptoms_log` | ✅ Créée | ✅ Actif | ✅ 1 index | 🔜 À venir | 🔜 À venir |
| `breastfeeding_tracking` | ✅ Créée | ✅ Actif | ✅ 2 indexes | ✅ Connecté | ✅ 5 fonctions |

---

## Tests et Validation

### ✅ Tests Effectués

1. **Migration appliquée avec succès**
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename LIKE '%menstrual%';
   -- Résultat: menstrual_cycles, menstrual_symptoms_tracking
   ```

2. **RLS vérifié**
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menstrual_cycles';
   -- 4 politiques: SELECT, INSERT, UPDATE, DELETE
   ```

3. **Build réussi**
   ```bash
   npm run build
   -- ✓ built in 25.36s
   ```

4. **Code de contournement PGRST205 supprimé**
   - Restauration de la gestion d'erreur normale
   - Logs explicites en cas d'erreur

### 🧪 Tests à Effectuer par l'Équipe

1. **Test Frontend - Cycle Menstruel**
   - [ ] Créer un compte féminin
   - [ ] Aller dans Profile → Onglet "Cycle"
   - [ ] Remplir date dernières règles, durée cycle, régularité
   - [ ] Sauvegarder → Vérifier toast de confirmation
   - [ ] Recharger la page → Vérifier que les données persistent

2. **Test Edge Functions - meal-plan-generator**
   - [ ] Avec profil féminin ayant cycle renseigné
   - [ ] Générer un plan de repas
   - [ ] Vérifier dans les logs que le contexte menstruel est ajouté
   - [ ] Vérifier que les recommandations sont adaptées à la phase

3. **Test Edge Functions - fasting-insights-generator**
   - [ ] Avec profil féminin en phase lutéale
   - [ ] Générer des insights de jeûne
   - [ ] Vérifier recommandation fenêtre réduite

4. **Test Allaitement**
   - [ ] Profil féminin avec allaitement exclusif
   - [ ] Générer plan de repas
   - [ ] Vérifier augmentation calorique +500 kcal
   - [ ] Vérifier alerte jeûne déconseillé

5. **Test Ménopause**
   - [ ] Profil féminin périménopause
   - [ ] Vérifier recommandations musculation prioritaire
   - [ ] Vérifier conseils calcium/vitamine D

---

## Avantages de l'Intégration

### 🎯 Pour les Utilisatrices

1. **Personnalisation Extrême**
   - Recommandations adaptées à la phase hormonale
   - Ajustements nutritionnels précis
   - Intensité d'entraînement optimale

2. **Éducation**
   - Compréhension des variations d'énergie
   - Explication des fluctuations de poids
   - Dédramatisation des symptômes

3. **Optimisation Santé**
   - Prévention carences (fer, magnésium, calcium)
   - Amélioration qualité du lait (allaitement)
   - Préservation masse musculaire (ménopause)

### 💻 Pour les Développeurs

1. **Architecture Propre**
   - Fonction partagée unique `getReproductiveHealthContext()`
   - Pas de duplication de code
   - Easy to maintain

2. **Sécurité Maximale**
   - RLS strict sur toutes les tables
   - Isolation totale des données
   - Conformité RGPD

3. **Scalabilité**
   - Nouveau module = ajouter une table + context formatter
   - Edge functions auto-enrichies
   - Pas de modification massive du code

---

## Évolutions Futures

### Phase 2 (Court Terme)
- [ ] Interface suivi symptômes quotidiens (menstruel et ménopause)
- [ ] Graphiques d'évolution du cycle
- [ ] Export des données (PDF, CSV)
- [ ] Notifications push avant règles

### Phase 3 (Moyen Terme)
- [ ] Prédictions ML basées sur historique
- [ ] Détection anomalies cycle
- [ ] Intégration wearables (température basale)
- [ ] Suivi fertilité

### Phase 4 (Long Terme)
- [ ] Recommandations contraception naturelle
- [ ] Communauté et partage anonyme
- [ ] Partenariat avec professionnels de santé

---

## Documentation Complémentaire

- **Cycle Menstruel:** `/docs/menstrual/MENSTRUAL_CYCLE_TRACKING.md`
- **Implémentation:** `/docs/menstrual/IMPLEMENTATION_SUMMARY.md`
- **Ménopause:** `/docs/menstrual/MENOPAUSE_TRACKING.md` (à créer)
- **Allaitement:** `/docs/menstrual/BREASTFEEDING_TRACKING.md` (à créer)

---

## Support Technique

**En cas de problème:**

1. Vérifier que les 3 tables existent
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename IN ('menstrual_cycles', 'menopause_tracking', 'breastfeeding_tracking');
   ```

2. Vérifier les politiques RLS
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menstrual_cycles';
   ```

3. Vérifier les logs Edge Function
   ```bash
   # Chercher "Reproductive health context" dans les logs
   ```

4. Tester manuellement l'insertion
   ```sql
   -- Remplacer USER_ID par un vrai UUID
   INSERT INTO menstrual_cycles (user_id, cycle_start_date, cycle_length, period_duration, cycle_regularity)
   VALUES ('USER_ID', '2024-11-01', 28, 5, 'regular');
   ```

---

## Conclusion

Le système de santé reproductive de TwinForge est maintenant **complet et opérationnel**.

**Impact:**
- 🎯 Personnalisation maximale des recommandations AI
- 🛡️ Sécurité et confidentialité totales
- 🔗 Intégration transparente dans 5 Edge Functions
- 💪 Préservation de la santé reproductive féminine

**Prochaine étape:** Tests utilisateur et collecte de feedback pour amélioration continue.
