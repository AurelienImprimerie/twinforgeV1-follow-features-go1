/**
 * WOD Formats Module
 * Complete descriptions of AMRAP, For Time, EMOM, Tabata, Chipper, and Ladder formats
 */

export const WOD_FORMATS_SECTION = `
# Formats WOD Complets

## 1. AMRAP (As Many Rounds As Possible)

**Description**: Compléter maximum de rounds dans temps imparti

**Structure**:
- Durée: 10-30 minutes (optimal: 15-20 min)
- Liste fixe d'exercices avec reps fixées
- Score = rounds + reps additionnelles

**Exemples**:
\`\`\`
AMRAP 20min:
5 Pull-ups
10 Push-ups
15 Air Squats
\`\`\`

**Stratégie coaching**:
- Rythme soutenable: commencer 70-80% vitesse max
- Break smart: avant échec musculaire
- Pacing: rounds réguliers (pas de sprint/crash)

**Scaling**:
- Foundations: Réduire reps (3-6-9 au lieu de 5-10-15)
- Scaled: Modifier mouvements (ring rows, knee push-ups)
- Rx: As prescribed

---

## 2. For Time (Contre la Montre)

**Description**: Compléter travail prescrit le plus vite possible

**Structure**:
- Travail fixe à terminer
- Time cap: 10-30 minutes
- Score = temps de completion

**Patterns courants**:
- 21-15-9 (Fran, Diane)
- Rounds fixes (3-5 rounds)
- Chipper (liste longue à faire 1×)

**Exemples**:
\`\`\`
For Time (time cap 12min):
21-15-9
Thrusters (95/65)
Pull-ups
\`\`\`

**Stratégie coaching**:
- Calculer pace target avant début
- Ne pas exploser early rounds
- Unbroken sets si possible (technique permets)
- Mental: découper en mini-objectives

---

## 3. EMOM (Every Minute On the Minute)

**Description**: Travail structuré à chaque minute

**Structure**:
- Durée: 10-30 minutes
- Travail prescrit au début de chaque minute
- Rest = temps restant dans minute

**Variations**:
- EMOM simple: même exercice chaque minute
- EMOM alternée: A/B alternating
- EMOM complexe: A/B/C rotation

**Exemples**:
\`\`\`
EMOM 12min:
Min 1: 15 Wall Balls
Min 2: 12 Burpees
(Repeat × 6 rounds)
\`\`\`

**Stratégie coaching**:
- Choisir reps permettant 15-20s rest minimum
- Si rest < 10s: trop intense, scale down
- Maintenir consistency sur toute durée

---

## 4. Tabata (High Intensity Intervals)

**Description**: 8 rounds de 20sec work / 10sec rest

**Structure**:
- Total: 4 minutes
- 8 rounds × (20s on / 10s off)
- Score = reps minimum sur 1 round

**Exemples**:
\`\`\`
Tabata Air Squats
8 rounds:
:20 Max Air Squats
:10 Rest
Score = lowest round
\`\`\`

**Stratégie coaching**:
- All-out effort sur :20
- Score = reps du worst round (consistency test)
- Mental game: "8 rounds only, go hard"

---

## 5. Chipper

**Description**: Longue liste mouvements à faire une fois

**Structure**:
- 6-12 exercices différents
- Faire chaque une seule fois (gros volume)
- For time avec time cap long (20-40 min)

**Exemples**:
\`\`\`
For Time (30min cap):
50 Wall Balls
40 Pull-ups
30 Kettlebell Swings
20 Handstand Push-ups
10 Burpees Over Box
\`\`\`

**Stratégie coaching**:
- Pacing ultra-important (éviter burnout)
- Break intelligemment: 5-10 reps clusters
- Mental: check-off exercises (progression visible)

---

## 6. Ladder

**Description**: Progression croissante ou décroissante

**Structure**:
- Reps augmentent ou diminuent chaque round
- Variations: Up ladder, Down ladder, Up-Down ladder

**Exemples**:
\`\`\`
Death by Burpees (Up Ladder):
Min 1: 1 Burpee
Min 2: 2 Burpees
Min 3: 3 Burpees
... continue jusqu'à échec
\`\`\`

**Stratégie coaching**:
- Start easy (early rounds = warmup)
- Difficulty exponentielle (calculer où ça crash)
- Mental: round-by-round, pas penser au total
`;
