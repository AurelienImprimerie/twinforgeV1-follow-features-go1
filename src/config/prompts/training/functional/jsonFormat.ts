/**
 * JSON Format & Examples Module
 * Complete JSON structure and validation requirements for WOD prescriptions
 */

export const JSON_FORMAT_SECTION = `
# Format JSON Prescription WOD

RETOURNE toujours structure JSON complète:

\`\`\`json
{
  "sessionId": "uuid",
  "sessionName": "Fran - Classic Girl WOD",
  "type": "Functional Fitness",
  "category": "functional-crosstraining",
  "wodFormat": "forTime",
  "wodName": "Fran",
  "timeCapMinutes": 10,
  "durationTarget": 25,
  "focus": ["Conditioning métabolique", "Power endurance", "Mental toughness"],
  "sessionSummary": "Fran est le benchmark Girl WOD le plus célèbre. Court, intense, teste capacity thrusters + pull-ups. Objectif: maintenir intensity tout du long.",

  "warmup": {
    "duration": 8,
    "isOptional": true,
    "exercises": [
      {
        "id": "wu-1",
        "name": "Row facile",
        "duration": 180,
        "instructions": "Pace conversational, activation cardio",
        "targetAreas": ["cardiovascular", "legs"]
      },
      {
        "id": "wu-2",
        "name": "Hip openers",
        "sets": 2,
        "reps": 10,
        "instructions": "Leg swings, hip circles, deep squats",
        "targetAreas": ["hips", "ankles"]
      },
      {
        "id": "wu-3",
        "name": "Shoulder mobility",
        "sets": 2,
        "reps": 10,
        "instructions": "Pass-throughs PVC, arm circles",
        "targetAreas": ["shoulders", "thoracic"]
      },
      {
        "id": "wu-4",
        "name": "Movement prep",
        "instructions": "3 rounds light: 5 thrusters (empty bar), 5 pull-ups",
        "targetAreas": ["full-body"]
      }
    ],
    "notes": "Warm-up essentiel. Olympic lifts + gymnastic demandent mobilité et activation."
  },

  "exercises": [
    {
      "id": "ex-1",
      "name": "Thruster",
      "variant": "Barbell",
      "category": "weighted",
      "sets": 3,
      "reps": "21-15-9",
      "weightKg": 43,
      "rest": 0,
      "rpeTarget": 9,
      "techniqueLevel": "proficient",
      "movementPattern": "Squat to overhead press",

      "scalingOptions": [
        {
          "level": "rx",
          "modification": "43kg (male) / 29kg (female)",
          "description": "Standard Fran weights"
        },
        {
          "level": "scaled",
          "modification": "35kg (male) / 25kg (female)",
          "description": "Réduction 20-30% si technique limite"
        },
        {
          "level": "foundations",
          "modification": "15-25kg ou front squat + push press séparés",
          "description": "Apprentissage mouvement"
        }
      ],

      "executionCues": [
        "Full depth squat (hip crease below knee)",
        "Explosive drive out of bottom",
        "Bar path vertical (pas forward)",
        "Lockout complet overhead"
      ],

      "commonFaults": [
        "Shallow squat depth",
        "Press out (no drive from legs)",
        "Bar loops forward",
        "Elbows drop in front rack"
      ],

      "safetyNotes": [
        "Technique breakdown: STOP et scale",
        "Si rounded back: réduire poids",
        "Mobilité épaules critique pour overhead"
      ],

      "coachNotes": "Thrusters = leg endurance + shoulder stamina. Break intelligent: 7-7-7 ou 10-11 si fort. Transition rapide vers pull-ups.",
      "coachTips": [
        "Big breath top of each rep",
        "Elbows high in front rack",
        "Think UP not forward"
      ]
    },

    {
      "id": "ex-2",
      "name": "Pull-ups",
      "variant": "Kipping or Strict",
      "category": "gymnastic",
      "sets": 3,
      "reps": "21-15-9",
      "rest": 0,
      "rpeTarget": 9,
      "techniqueLevel": "proficient",
      "movementPattern": "Vertical pull",

      "scalingOptions": [
        {
          "level": "rx",
          "modification": "Kipping or strict pull-ups",
          "description": "Chin over bar minimum"
        },
        {
          "level": "scaled",
          "modification": "Jumping pull-ups or band-assisted",
          "description": "Assistance si < 10 strict pull-ups"
        },
        {
          "level": "foundations",
          "modification": "Ring rows",
          "description": "Apprentissage pulling strength"
        }
      ],

      "executionCues": [
        "Chin clearly over bar",
        "Full arm extension at bottom",
        "Minimize excessive kip",
        "Consistent rhythm"
      ],

      "commonFaults": [
        "No full ROM (chin not over)",
        "Excessive butterfly (energy waste)",
        "Death grip (forearm fatigue)",
        "Breaking too early"
      ],

      "safetyNotes": [
        "Si shoulder pain: STOP",
        "Kipping volume = stress tendons",
        "Pas kipping si < 5 strict pull-ups"
      ],

      "coachNotes": "Pull-ups après thrusters = grip + lat fatigue. Minimize breaks. Si unbroken impossible: sets de 5-7 reps.",
      "coachTips": [
        "Quick transitions (< 5 secondes)",
        "Shake out arms entre sets",
        "Mental: one rep at a time"
      ]
    }
  ],

  "wodStructure": "21-15-9 for time (3 rounds decreasing reps)",

  "rxVersion": [
    { "movementName": "Thruster", "prescription": "43kg / 29kg" },
    { "movementName": "Pull-ups", "prescription": "Kipping or Strict" }
  ],

  "scaledVersion": [
    { "movementName": "Thruster", "prescription": "35kg / 25kg" },
    { "movementName": "Pull-ups", "prescription": "Jumping or Band-assisted" }
  ],

  "foundationsVersion": [
    { "movementName": "Front Squat + Push Press", "prescription": "15-25kg" },
    { "movementName": "Ring Rows", "prescription": "Bodyweight" }
  ],

  "cooldown": {
    "duration": 10,
    "exercises": [
      "Marche facile 3-5 min (recovery HR)",
      "Foam roll quads, lats",
      "Stretch: shoulders, hip flexors, hamstrings"
    ],
    "notes": "Recovery active. Hydratation. Nutrition post-WOD dans 30-60min."
  },

  "overallNotes": "Fran = mental game. Discomfort va être intense. Embrace the suck. Finish strong. Track ton time pour comparaison future.",
  "expectedRpe": 9,
  "expectedIntensity": "extreme",
  "coachRationale": "Fran teste conditioning métabolique, power endurance, mental toughness. Pattern thrusters + pull-ups = full body. Court et intense = CrossFit classic. Scale si nécessaire pour maintenir intensity (pas rendre facile)."
}
\`\`\`

**Validation obligatoire**:
- \`wodFormat\` doit être valide: amrap, forTime, emom, tabata, chipper, ladder
- \`scalingOptions\` minimum 3 tiers: foundations, scaled, rx
- \`timeCapMinutes\` toujours présent
- \`expectedIntensity\` entre low, moderate, high, extreme
- Si Olympic lifts: \`techniqueLevel\` et \`safetyNotes\` obligatoires
`;
