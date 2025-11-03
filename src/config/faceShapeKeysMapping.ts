// src/config/faceShapeKeysMapping.ts
/**
 * Mapping des clés de forme faciales techniques vers des noms UX compréhensibles en français
 * Organisé par catégories pour une interface utilisateur intuitive
 */

export interface FaceShapeKeyConfig {
  key: string;              // Clé technique Blender
  label: string;            // Nom affiché à l'utilisateur
  description?: string;     // Description optionnelle
  min: number;              // Valeur minimale
  max: number;              // Valeur maximale
  default: number;          // Valeur par défaut
  step: number;             // Pas d'incrémentation
}

export interface FaceShapeCategory {
  id: string;
  label: string;
  icon: string;
  keys: FaceShapeKeyConfig[];
}

/**
 * Ensemble simplifié des clés de forme faciales les plus importantes
 * Sélection basée sur l'impact visuel et la facilité de compréhension
 */
export const FACE_SHAPE_KEYS_MAPPING: FaceShapeCategory[] = [
  {
    id: 'face_shape',
    label: 'Forme du visage',
    icon: 'Circle',
    keys: [
      {
        key: 'FaceJawWidth',
        label: 'Largeur de la mâchoire',
        description: 'Élargir ou affiner la mâchoire',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceCheekboneWidth',
        label: 'Largeur des pommettes',
        description: 'Ajuster la largeur des pommettes',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceWidth',
        label: 'Largeur du visage',
        description: 'Visage plus large ou plus étroit',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceChinHeight',
        label: 'Longueur du menton',
        description: 'Menton plus long ou plus court',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceChinWidth',
        label: 'Largeur du menton',
        description: 'Menton plus large ou plus pointu',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  },
  {
    id: 'eyes',
    label: 'Yeux',
    icon: 'Eye',
    keys: [
      {
        key: 'FaceEyeSize',
        label: 'Taille des yeux',
        description: 'Yeux plus grands ou plus petits',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceEyeDistance',
        label: 'Écartement des yeux',
        description: 'Yeux plus rapprochés ou plus écartés',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceEyeHeight',
        label: 'Hauteur des yeux',
        description: 'Position verticale des yeux',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceEyelidDepth',
        label: 'Profondeur des paupières',
        description: 'Paupières plus ou moins enfoncées',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceMonolid',
        label: 'Paupière monolid',
        description: 'Style de paupière asiatique',
        min: 0,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  },
  {
    id: 'nose',
    label: 'Nez',
    icon: 'Wind',
    keys: [
      {
        key: 'FaceNoseSize',
        label: 'Taille du nez',
        description: 'Nez plus grand ou plus petit',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceNoseWidth',
        label: 'Largeur du nez',
        description: 'Nez plus large ou plus fin',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceNoseBridge',
        label: 'Arête du nez',
        description: 'Pont du nez plus ou moins prononcé',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceNoseTip',
        label: 'Bout du nez',
        description: 'Forme du bout du nez',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  },
  {
    id: 'mouth',
    label: 'Bouche',
    icon: 'Smile',
    keys: [
      {
        key: 'FaceMouthWidth',
        label: 'Largeur de la bouche',
        description: 'Bouche plus large ou plus étroite',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceLipThickness',
        label: 'Épaisseur des lèvres',
        description: 'Lèvres plus pulpeuses ou plus fines',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceUpperLipThickness',
        label: 'Épaisseur lèvre supérieure',
        description: 'Lèvre supérieure plus ou moins épaisse',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceLowerLipThickness',
        label: 'Épaisseur lèvre inférieure',
        description: 'Lèvre inférieure plus ou moins épaisse',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceMouthHeight',
        label: 'Position de la bouche',
        description: 'Bouche plus haute ou plus basse',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  },
  {
    id: 'cheeks',
    label: 'Pommettes',
    icon: 'Circle',
    keys: [
      {
        key: 'FaceCheekboneHeight',
        label: 'Hauteur des pommettes',
        description: 'Pommettes plus hautes ou plus basses',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceCheekboneDepth',
        label: 'Profondeur des pommettes',
        description: 'Pommettes plus saillantes ou plates',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceCheekFullness',
        label: 'Rondeur des joues',
        description: 'Joues plus rondes ou plus creuses',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  },
  {
    id: 'forehead',
    label: 'Front',
    icon: 'Minus',
    keys: [
      {
        key: 'FaceForeheadHeight',
        label: 'Hauteur du front',
        description: 'Front plus haut ou plus bas',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceForeheadWidth',
        label: 'Largeur du front',
        description: 'Front plus large ou plus étroit',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      },
      {
        key: 'FaceForeheadDepth',
        label: 'Profondeur du front',
        description: 'Front plus bombé ou plus plat',
        min: -1,
        max: 1,
        default: 0,
        step: 0.05
      }
    ]
  }
];

/**
 * Récupérer toutes les clés de forme faciales aplaties
 */
export function getAllFaceShapeKeys(): FaceShapeKeyConfig[] {
  return FACE_SHAPE_KEYS_MAPPING.flatMap(category => category.keys);
}

/**
 * Trouver la configuration d'une clé spécifique
 */
export function getFaceShapeKeyConfig(key: string): FaceShapeKeyConfig | undefined {
  return getAllFaceShapeKeys().find(config => config.key === key);
}

/**
 * Créer un objet de valeurs par défaut pour toutes les clés
 */
export function getDefaultFaceShapeValues(): Record<string, number> {
  const defaults: Record<string, number> = {};
  getAllFaceShapeKeys().forEach(config => {
    defaults[config.key] = config.default;
  });
  return defaults;
}

/**
 * Valider et normaliser les valeurs de clés de forme
 */
export function normalizeFaceShapeValue(key: string, value: number): number {
  const config = getFaceShapeKeyConfig(key);
  if (!config) return value;

  // Clamp value between min and max
  return Math.max(config.min, Math.min(config.max, value));
}
