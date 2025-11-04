/**
 * Reproductive Health Context - Shared Utility for Edge Functions
 *
 * Retrieves menstrual cycle, menopause, and breastfeeding data and formats it for AI prompts
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

interface ReproductiveHealthContext {
  hasData: boolean;
  status: 'menstruating' | 'perimenopause' | 'menopause' | 'postmenopause' | null;
  formattedContext: string;
}

/**
 * Get reproductive health context for a user
 * Handles menstrual cycles, menopause tracking, and breastfeeding status
 */
export async function getReproductiveHealthContext(
  userId: string,
  supabase: SupabaseClient
): Promise<ReproductiveHealthContext> {
  try {
    // Check breastfeeding status first (independent of reproductive cycle)
    const { data: breastfeeding, error: breastfeedingError } = await supabase
      .from('breastfeeding_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (breastfeedingError) {
      console.error('Error fetching breastfeeding data:', breastfeedingError);
    }

    const { data: menopause, error: menopauseError } = await supabase
      .from('menopause_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (menopauseError) {
      console.error('Error fetching menopause data:', menopauseError);
    }

    if (menopause && menopause.reproductive_status !== 'menstruating') {
      let context = formatMenopauseContext(menopause);
      if (breastfeeding && breastfeeding.is_breastfeeding) {
        context += formatBreastfeedingContext(breastfeeding);
      }
      return {
        hasData: true,
        status: menopause.reproductive_status,
        formattedContext: context,
      };
    }

    const { data: menstrual, error: menstrualError } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('cycle_start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (menstrualError) {
      console.error('Error fetching menstrual data:', menstrualError);
    }

    if (menstrual) {
      let context = formatMenstrualContext(menstrual);
      if (breastfeeding && breastfeeding.is_breastfeeding) {
        context += formatBreastfeedingContext(breastfeeding);
      }
      return {
        hasData: true,
        status: 'menstruating',
        formattedContext: context,
      };
    }

    // No reproductive cycle data, but check if breastfeeding
    if (breastfeeding && breastfeeding.is_breastfeeding) {
      return {
        hasData: true,
        status: null,
        formattedContext: formatBreastfeedingContext(breastfeeding),
      };
    }

    return {
      hasData: false,
      status: null,
      formattedContext: '',
    };
  } catch (error) {
    console.error('Error in getReproductiveHealthContext:', error);
    return {
      hasData: false,
      status: null,
      formattedContext: '',
    };
  }
}

/**
 * Format menopause data for AI context
 */
function formatMenopauseContext(data: any): string {
  const statusLabels: Record<string, string> = {
    menstruating: 'Cycle menstruel actif',
    perimenopause: 'Périménopause',
    menopause: 'Ménopause',
    postmenopause: 'Post-ménopause',
  };

  const today = new Date();
  let daysSinceLastPeriod: number | null = null;
  let daysUntilConfirmation: number | null = null;

  if (data.last_period_date) {
    const lastPeriod = new Date(data.last_period_date);
    daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));

    if (data.reproductive_status === 'perimenopause' && daysSinceLastPeriod < 365) {
      daysUntilConfirmation = 365 - daysSinceLastPeriod;
    }
  }

  let context = `\n## STATUT REPRODUCTIF\n\nStatut actuel: ${statusLabels[data.reproductive_status] || data.reproductive_status}\n`;

  if (data.perimenopause_stage) {
    context += `Stade: ${data.perimenopause_stage === 'early' ? 'Précoce' : 'Tardif'}\n`;
  }

  if (daysSinceLastPeriod !== null) {
    context += `Jours depuis dernières règles: ${daysSinceLastPeriod}\n`;
  }

  if (daysUntilConfirmation !== null) {
    context += `Jours jusqu'à confirmation ménopause: ${daysUntilConfirmation}\n`;
  }

  if (data.fsh_level) {
    context += `Niveau FSH: ${data.fsh_level} UI/L\n`;
  }

  if (data.estrogen_level) {
    context += `Niveau œstrogène: ${data.estrogen_level} pg/mL\n`;
  }

  context += `\n## RECOMMANDATIONS ADAPTÉES\n\n`;

  if (data.reproductive_status === 'perimenopause') {
    context += `### Nutrition\n`;
    context += `- Augmenter protéines: 25-30g par repas (préservation masse musculaire)\n`;
    context += `- Calcium 1200mg/jour: produits laitiers, légumes verts, tofu\n`;
    context += `- Vitamine D 800-1000 UI/jour: poissons gras, œufs, suppléments\n`;
    context += `- Oméga-3 anti-inflammatoires: saumon, sardines, noix\n`;
    context += `- Phytoestrogènes: soja, graines de lin\n`;
    context += `- Limiter caféine et alcool (bouffées de chaleur)\n\n`;

    context += `### Exercice\n`;
    context += `- PRIORITÉ: Musculation 3x/semaine minimum\n`;
    context += `- Exercices de résistance avec poids\n`;
    context += `- Cardio modéré 150min/semaine\n`;
    context += `- HIIT 1-2x/semaine (métabolisme)\n`;
    context += `- Récupération: 48h entre sessions de force\n\n`;

    context += `### Jeûne\n`;
    context += `- Fenêtre réduite: 14-16h maximum\n`;
    context += `- Éviter jeûnes prolongés (stress hormonal)\n`;
    context += `- Flexibilité importante\n`;
    context += `- Breaking OK si hypoglycémie ou fatigue\n\n`;
  } else if (data.reproductive_status === 'menopause' || data.reproductive_status === 'postmenopause') {
    context += `### Nutrition\n`;
    context += `- Protéines élevées: 1,2-1,5g/kg (maintien musculaire)\n`;
    context += `- Calcium et vitamine D prioritaires (ostéoporose)\n`;
    context += `- Fibres solubles (santé cardiovasculaire)\n`;
    context += `- Limiter sel (hypertension)\n`;
    context += `- Antioxydants: baies, légumes colorés\n\n`;

    context += `### Exercice\n`;
    context += `- Musculation 3-4x/semaine (essentiel)\n`;
    context += `- Focus exercices composés\n`;
    context += `- Cardio 30-45min, 4-5x/semaine\n`;
    context += `- Exercices d'équilibre (prévention chutes)\n`;
    context += `- Stretching quotidien\n\n`;

    context += `### Jeûne\n`;
    context += `- Fenêtre modérée: 12-14h recommandé\n`;
    context += `- Priorité régularité des repas\n`;
    context += `- Éviter OMAD ou jeûnes > 16h\n`;
    context += `- Protéines à chaque repas\n\n`;
  }

  context += `IMPORTANT: Adapte toutes tes recommandations à ce statut hormonal et métabolique.\n`;

  return context;
}

/**
 * Format menstrual cycle data for AI context
 */
function formatMenstrualContext(data: any): string {
  const today = new Date();
  const lastPeriod = new Date(data.cycle_start_date);
  const dayInCycle = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ovulationDay = Math.floor(data.cycle_length / 2);
  const daysUntilNextPeriod = data.cycle_length - dayInCycle;

  let phase = 'unknown';
  let phaseDescription = '';
  let energyLevel = '';
  let metabolicRate = '';

  if (dayInCycle <= 5) {
    phase = 'menstruation';
    phaseDescription = 'Phase menstruelle en cours';
    energyLevel = 'low';
    metabolicRate = 'reduced';
  } else if (dayInCycle < ovulationDay - 2) {
    phase = 'follicular';
    phaseDescription = 'Énergie croissante, bon moment pour l\'entraînement';
    energyLevel = 'high';
    metabolicRate = 'elevated';
  } else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
    phase = 'ovulation';
    phaseDescription = 'Pic d\'énergie, performances maximales possibles';
    energyLevel = 'peak';
    metabolicRate = 'elevated';
  } else {
    phase = 'luteal';
    phaseDescription = 'Énergie décroissante, privilégiez la récupération';
    energyLevel = dayInCycle < data.cycle_length - 5 ? 'moderate' : 'low';
    metabolicRate = 'reduced';
  }

  let context = `\n## CYCLE MENSTRUEL\n\nPhase actuelle: ${phase}\n`;
  context += `Jour du cycle: J${dayInCycle}/${data.cycle_length}\n`;
  context += `Régularité: ${data.cycle_regularity}\n`;
  context += `Prochaines règles dans: ${Math.max(0, daysUntilNextPeriod)} jours\n`;
  context += `Niveau d'énergie: ${energyLevel}\n`;
  context += `Métabolisme: ${metabolicRate}\n\n`;
  context += `${phaseDescription}\n\n`;

  context += `CONSIDÉRATIONS HORMONALES PAR PHASE:\n\n`;

  if (phase === 'menstruation') {
    context += `**Menstruation (J1-J5)**\n`;
    context += `- Besoins accrus: Fer, vitamine C, magnésium\n`;
    context += `- Hydratation importante\n`;
    context += `- Éviter aliments pro-inflammatoires\n`;
    context += `- Intensité entraînement: Modérée à légère\n`;
    context += `- Jeûne: 12-14h maximum\n`;
  } else if (phase === 'follicular') {
    context += `**Phase Folliculaire**\n`;
    context += `- Énergie croissante, métabolisme optimal\n`;
    context += `- Bon moment pour déficit calorique si objectif perte de poids\n`;
    context += `- Favoriser glucides complexes pré-entraînement\n`;
    context += `- Intensité entraînement: Haute (PRs possibles)\n`;
    context += `- Jeûne: 16-18h bien toléré\n`;
  } else if (phase === 'ovulation') {
    context += `**Ovulation**\n`;
    context += `- Pic d'énergie et performances\n`;
    context += `- Métabolisme et sensibilité insuline optimaux\n`;
    context += `- Bon timing pour repas plus riches en glucides\n`;
    context += `- Intensité entraînement: Maximale\n`;
    context += `- Jeûne: Excellente tolérance\n`;
  } else if (phase === 'luteal') {
    context += `**Phase Lutéale**\n`;
    context += `- Métabolisme ralentit légèrement\n`;
    context += `- Rétention d'eau possible\n`;
    context += `- Augmenter fibres et magnésium\n`;
    context += `- Gérer envies sucrées avec alternatives saines\n`;
    context += `- Intensité entraînement: Modérée (maintien)\n`;
    context += `- Jeûne: Raccourcir de 1-2h\n`;
  }

  context += `\nAdapte tes recommandations à la phase actuelle.\n`;

  return context;
}

/**
 * Format breastfeeding data for AI context
 */
function formatBreastfeedingContext(data: any): string {
  const typeLabels: Record<string, string> = {
    exclusive: 'Allaitement exclusif',
    mixed: 'Allaitement mixte (sein + biberon/solides)',
    weaning: 'Sevrage en cours',
  };

  let context = `\n\n## ALLAITEMENT 🤱\n\n`;
  context += `Statut: ALLAITE ACTUELLEMENT\n`;

  if (data.breastfeeding_type) {
    context += `Type: ${typeLabels[data.breastfeeding_type] || data.breastfeeding_type}\n`;
  }

  if (data.baby_age_months !== null && data.baby_age_months !== undefined) {
    const babyAge = data.baby_age_months;
    let ageCategory = '';
    if (babyAge <= 1) ageCategory = 'Nouveau-né (0-1 mois)';
    else if (babyAge <= 3) ageCategory = 'Nourrisson jeune (1-3 mois)';
    else if (babyAge <= 6) ageCategory = 'Nourrisson (3-6 mois)';
    else if (babyAge <= 12) ageCategory = 'Bébé (6-12 mois)';
    else if (babyAge <= 24) ageCategory = 'Jeune enfant (12-24 mois)';
    else ageCategory = 'Enfant (24+ mois)';

    context += `Âge du bébé: ${babyAge} mois - ${ageCategory}\n`;
  }

  context += `\n## BESOINS NUTRITIONNELS SPÉCIFIQUES\n\n`;

  const isExclusive = data.breastfeeding_type === 'exclusive';
  const isMixed = data.breastfeeding_type === 'mixed';
  const babyAge = data.baby_age_months || 0;

  // Adjust calorie needs based on type and baby age
  let calorieIncrease = 500;
  if (isMixed) calorieIncrease = 350;
  else if (data.breastfeeding_type === 'weaning') calorieIncrease = 250;

  // Reduce needs if baby is older and eating more solids
  if (babyAge > 6) {
    calorieIncrease = Math.round(calorieIncrease * 0.85);
  }

  context += `### Apport Calorique\n`;
  context += `CRITIQUE: Augmenter de +${calorieIncrease} kcal/jour minimum\n`;
  context += `- Production de lait = dépense énergétique importante\n`;
  context += `- Ne JAMAIS proposer de déficit calorique pendant l'allaitement\n`;
  context += `- Maintenir un apport calorique suffisant est essentiel pour qualité du lait\n\n`;

  context += `### Macronutriments\n`;
  context += `- Protéines: +${isExclusive ? 25 : 15}g/jour (1,3-1,5g/kg)\n`;
  context += `  → Viandes maigres, poissons, œufs, légumineuses\n`;
  context += `- Glucides complexes: Privilégier (énergie durable)\n`;
  context += `  → Avoine, quinoa, patates douces, pain complet\n`;
  context += `- Lipides de qualité: Oméga-3 DHA 300mg/jour minimum\n`;
  context += `  → Saumon, sardines, maquereau, noix, graines de lin\n\n`;

  context += `### Micronutriments Essentiels\n`;
  context += `- Calcium: 1300mg/jour (lait, yaourt, fromage, brocoli, amandes)\n`;
  context += `- Fer: 9mg/jour (viande rouge, lentilles, épinards + vitamine C)\n`;
  context += `- Vitamine D: 600 UI/jour (poissons gras, œufs, exposition soleil)\n`;
  context += `- Iode: 290mcg/jour (poissons, produits laitiers, sel iodé)\n`;
  context += `- Vitamine B12: Important (produits animaux)\n`;
  context += `- Zinc: 12mg/jour (viandes, fruits de mer, graines de courge)\n\n`;

  context += `### HYDRATATION CRITIQUE 💧\n`;
  context += `- Eau: 3 litres/jour MINIMUM\n`;
  context += `- Boire avant, pendant et après chaque tétée\n`;
  context += `- Déshydratation = baisse production de lait\n`;
  context += `- Tisanes d'allaitement OK (fenouil, anis)\n`;
  context += `- Limiter caféine: Max 300mg/jour (2 cafés)\n\n`;

  context += `### ALIMENTS À FAVORISER\n`;
  context += `- Avoine (galactagogue naturel - stimule production lait)\n`;
  context += `- Saumon et poissons gras (DHA pour développement bébé)\n`;
  context += `- Légumes verts feuillus (fer, folate, calcium)\n`;
  context += `- Amandes et noix (protéines, calcium, bonnes graisses)\n`;
  context += `- Légumineuses (protéines végétales, fer)\n`;
  context += `- Œufs (protéines complètes, choline)\n`;
  context += `- Yaourt et kéfir (probiotiques, calcium)\n`;
  context += `- Patates douces (bêta-carotène, fibres)\n`;
  context += `- Graines de sésame et tahini (calcium)\n`;
  context += `- Fruits rouges (antioxydants)\n\n`;

  context += `### ALIMENTS À LIMITER ⚠️\n`;
  context += `- Caféine: Max 300mg/jour (passe dans le lait)\n`;
  context += `- Poissons à mercure élevé: Thon, espadon, requin\n`;
  context += `- Alcool: ÉVITER complètement\n`;
  context += `- Aliments très épicés: Peuvent altérer goût du lait\n`;
  context += `- Chou, brocoli en excès: Coliques possibles chez certains bébés\n`;
  context += `- Agrumes en très grande quantité: Irritation possible\n`;
  context += `- Ail et oignon crus en excès: Peuvent affecter goût du lait\n\n`;

  context += `### FRÉQUENCE DES REPAS\n`;
  context += `- 3 repas principaux + 2-3 collations nutritives/jour\n`;
  context += `- Ne JAMAIS sauter de repas\n`;
  context += `- Collations saines à portée de main pendant tétées\n`;
  context += `- Exemples collations:\n`;
  context += `  • Yaourt grec + fruits + noix\n`;
  context += `  • Houmous + légumes crus\n`;
  context += `  • Smoothie protéiné (banane, beurre d'amande, avoine)\n`;
  context += `  • Fromage + crackers complets\n`;
  context += `  • Barres maison (avoine, dattes, amandes)\n\n`;

  context += `## EXERCICE ET ALLAITEMENT\n\n`;
  context += `### Recommandations Générales\n`;
  context += `- Activité physique compatible et bénéfique\n`;
  context += `- MAIS adapter intensité et volume\n`;
  context += `- Priorité récupération post-partum\n`;
  context += `- Écouter son corps - fatigue fréquente\n\n`;

  if (babyAge <= 6) {
    context += `### Post-partum (0-6 mois)\n`;
    context += `- Marche quotidienne: 20-30min recommandé\n`;
    context += `- Exercices plancher pelvien: PRIORITÉ\n`;
    context += `- Renforcement doux: Core, dos, posture\n`;
    context += `- ÉVITER: HIIT intense, sauts, exercices haute impact\n`;
    context += `- Attendre feu vert médical avant intensifier\n`;
    context += `- Calories brûlées = augmenter apport en conséquence\n\n`;
  } else {
    context += `### Reprise Progressive (6+ mois)\n`;
    context += `- Intensité modérée à élevée possible\n`;
    context += `- Musculation: 2-3x/semaine OK\n`;
    context += `- Cardio: Modéré 150min/semaine\n`;
    context += `- Éviter HIIT extrême si fatigue importante\n`;
    context += `- Toujours compenser calories brûlées\n\n`;
  }

  context += `### Points d'Attention\n`;
  context += `- Allaiter ou tirer lait AVANT exercice (confort)\n`;
  context += `- Soutien-gorge de sport adapté allaitement\n`;
  context += `- Hydratation ++ avant/pendant/après\n`;
  context += `- Exercice intense peut temporairement augmenter acide lactique dans lait (pas dangereux)\n`;
  context += `- Si baisse production lait = réduire intensité\n\n`;

  context += `## JEÛNE INTERMITTENT ET ALLAITEMENT\n\n`;
  context += `### POSITION OFFICIELLE: DÉCONSEILLÉ\n`;
  context += `- Jeûne intermittent NON recommandé pendant allaitement\n`;
  context += `- Risques:\n`;
  context += `  • Baisse production de lait\n`;
  context += `  • Déshydratation\n`;
  context += `  • Carences nutritionnelles\n`;
  context += `  • Fatigue accrue\n`;
  context += `  • Hypoglycémie\n\n`;

  context += `### SI VRAIMENT SOUHAITÉ (avec précautions)\n`;
  context += `- Fenêtre TRÈS réduite: 12h MAXIMUM\n`;
  context += `- Exemple: 20h - 8h (pendant sommeil)\n`;
  context += `- Jamais plus de 14h\n`;
  context += `- JAMAIS OMAD ou jeûnes prolongés\n`;
  context += `- Arrêter immédiatement si:\n`;
  context += `  • Baisse production lait\n`;
  context += `  • Fatigue excessive\n`;
  context += `  • Vertiges, malaise\n`;
  context += `  • Bébé moins rassasié\n\n`;

  context += `### PRIORITÉ: Repas réguliers\n`;
  context += `- 3 repas + collations >>> Jeûne\n`;
  context += `- Stabilité énergétique essentielle\n`;
  context += `- Reporter jeûne après sevrage complet\n\n`;

  context += `## ÉVALUATION DES REPAS\n\n`;
  context += `### Critères d'Évaluation\n`;
  context += `Lors de l'analyse d'un repas, évaluer:\n`;
  context += `✓ Apport calorique suffisant (+${calorieIncrease} kcal/jour)\n`;
  context += `✓ Protéines adéquates (${isExclusive ? 25 : 15}g supplémentaires)\n`;
  context += `✓ Présence d'aliments galactagogues (avoine, amandes, etc.)\n`;
  context += `✓ Calcium (produits laitiers, légumes verts)\n`;
  context += `✓ Fer + vitamine C (absorption)\n`;
  context += `✓ Oméga-3 (poissons gras)\n`;
  context += `✓ Hydratation mentionnée ou rappelée\n`;
  context += `✗ Présence d'aliments à éviter (alcool, caféine excessive)\n`;
  context += `✗ Aliments potentiellement problématiques (épices fortes, chou en excès)\n\n`;

  context += `### Messages Personnalisés\n`;
  context += `- "Excellent pour l'allaitement: riche en calcium et protéines"\n`;
  context += `- "Bon choix: contient des oméga-3 essentiels pour le développement de bébé"\n`;
  context += `- "Attention: limiter la caféine pendant l'allaitement"\n`;
  context += `- "Penser à augmenter les portions pour couvrir les besoins de l'allaitement"\n`;
  context += `- "N'oubliez pas de boire un grand verre d'eau avec ce repas"\n\n`;

  context += `## INSIGHTS ET PROGRESSION\n\n`;
  context += `Dans les analyses de tendances nutritionnelles:\n`;
  context += `- Vérifier apport calorique moyen vs besoin (+${calorieIncrease} kcal)\n`;
  context += `- Analyser fréquence aliments galactagogues\n`;
  context += `- Évaluer équilibre macronutriments\n`;
  context += `- Rappeler importance hydratation\n`;
  context += `- Féliciter bons choix alimentaires\n`;
  context += `- Suggérer améliorations si carences détectées\n\n`;

  context += `CRITIQUE: Toutes tes recommandations doivent PRIORITISER la santé de la mère et la qualité du lait maternel.\n`;
  context += `JAMAIS proposer de restriction calorique ou de jeûne pendant l'allaitement.\n`;
  context += `Toujours adapter les conseils à l'âge du bébé et au type d'allaitement.\n`;

  return context;
}
