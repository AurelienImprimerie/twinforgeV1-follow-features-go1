import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton, TriStatePreferenceManager, ArrayItemManager } from '../ProfileNutritionComponents';
import { useUserStore } from '../../../../../system/store/userStore';

interface FoodPreferencesSectionProps {
  register: any;
  watchedValues: any;
  setValue: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * Map country codes to their cuisine names
 */
const COUNTRY_TO_CUISINE: Record<string, string> = {
  'FR': 'Française',
  'IT': 'Italienne',
  'ES': 'Espagnole',
  'MX': 'Mexicaine',
  'IN': 'Indienne',
  'GR': 'Grecque',
  'JP': 'Japonaise',
  'TH': 'Thaï',
  'LB': 'Libanaise',
  'MA': 'Marocaine',
  'CN': 'Chinoise',
  'KR': 'Coréenne',
  'VN': 'Vietnamienne',
  'US': 'Américaine',
  'GB': 'Britannique',
  'DE': 'Allemande',
  'TR': 'Turque',
  'BR': 'Brésilienne',
  'AR': 'Argentine',
  'PE': 'Péruvienne'
};

export const FoodPreferencesSection: React.FC<FoodPreferencesSectionProps> = ({
  register,
  watchedValues,
  setValue,
  isDirty,
  isSaving,
  onSave
}) => {
  const { profile } = useUserStore();
  const [newTextureAversion, setNewTextureAversion] = React.useState('');
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Auto-populate user's country cuisine on mount
  React.useEffect(() => {
    if (hasInitialized || !profile?.country) return;

    const currentCuisines = watchedValues.foodPreferences?.cuisines || [];

    // Only add if user hasn't already added cuisines
    if (currentCuisines.length === 0) {
      const userCountry = profile.country.toUpperCase();
      const cuisineName = COUNTRY_TO_CUISINE[userCountry];

      if (cuisineName) {
        // Add user's country cuisine with neutral preference
        setValue('foodPreferences.cuisines', [
          { name: cuisineName, preference: 'neutral' as const }
        ], { shouldDirty: false }); // Don't mark as dirty on auto-fill
      }
    }

    setHasInitialized(true);
  }, [profile?.country, watchedValues.foodPreferences?.cuisines, setValue, hasInitialized]);

  const addTextureAversion = React.useCallback(() => {
    if (newTextureAversion.trim()) {
      const current = watchedValues.sensoryPreferences?.textureAversions || [];
      const trimmed = newTextureAversion.trim();
      if (!current.includes(trimmed)) {
        setValue('sensoryPreferences.textureAversions', [...current, trimmed], { shouldDirty: true });
        setNewTextureAversion('');
      }
    }
  }, [newTextureAversion, watchedValues.sensoryPreferences?.textureAversions, setValue]);

  const removeTextureAversion = React.useCallback((index: number) => {
    const current = watchedValues.sensoryPreferences?.textureAversions || [];
    setValue('sensoryPreferences.textureAversions', current.filter((_, i) => i !== index), { shouldDirty: true });
  }, [watchedValues.sensoryPreferences?.textureAversions, setValue]);

  const handleCuisinesUpdate = React.useCallback((items: Array<{ name: string; preference: 'like' | 'neutral' | 'dislike' | 'ban' }>) => {
    setValue('foodPreferences.cuisines', items, { shouldDirty: true });
  }, [setValue]);

  const handleIngredientsUpdate = React.useCallback((items: Array<{ name: string; preference: 'like' | 'neutral' | 'dislike' | 'ban' }>) => {
    setValue('foodPreferences.ingredients', items, { shouldDirty: true });
  }, [setValue]);

  const handleFlavorsUpdate = React.useCallback((items: Array<{ name: string; preference: 'like' | 'neutral' | 'dislike' | 'ban' }>) => {
    setValue('foodPreferences.flavors', items, { shouldDirty: true });
  }, [setValue]);

  const cuisinesSuggestions = React.useMemo(() => [
    'Française', 'Italienne', 'Asiatique', 'Mexicaine', 'Indienne',
    'Méditerranéenne', 'Japonaise', 'Thaï', 'Libanaise', 'Marocaine'
  ], []);

  const ingredientsSuggestions = React.useMemo(() => [
    'Légumes verts', 'Fruits rouges', 'Poissons gras', 'Légumineuses',
    'Céréales complètes', 'Fromages', 'Épices', 'Herbes fraîches'
  ], []);

  const flavorsSuggestions = React.useMemo(() => [
    'Sucré', 'Salé', 'Épicé', 'Acide', 'Amer', 'Umami',
    'Fumé', 'Grillé', 'Crémeux', 'Croquant'
  ], []);

  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(16, 185, 129, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #10B981 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Heart} size={20} style={{ color: '#10B981' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Préférences Alimentaires</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Vos goûts et préférences culinaires détaillées</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">Goûts</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cuisines Preferences */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Cuisines du monde
          </label>
          <TriStatePreferenceManager
            items={watchedValues.foodPreferences?.cuisines || []}
            onUpdate={handleCuisinesUpdate}
            suggestions={cuisinesSuggestions}
            placeholder="Ajouter une cuisine..."
            itemColor="#A855F7"
          />
        </div>

        {/* Ingredients Preferences */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Ingrédients et familles d'aliments
          </label>
          <TriStatePreferenceManager
            items={watchedValues.foodPreferences?.ingredients || []}
            onUpdate={handleIngredientsUpdate}
            suggestions={ingredientsSuggestions}
            placeholder="Ajouter un ingrédient..."
            itemColor="#EC4899"
          />
        </div>

        {/* Flavors Preferences */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Saveurs et goûts
          </label>
          <TriStatePreferenceManager
            items={watchedValues.foodPreferences?.flavors || []}
            onUpdate={handleFlavorsUpdate}
            suggestions={flavorsSuggestions}
            placeholder="Ajouter une saveur..."
            itemColor="#F59E0B"
          />
        </div>

        {/* Sensory Preferences */}
        <div>
          <h4 className="text-white/90 text-sm font-medium mb-4">Préférences sensorielles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sensoryPreferences.spiceTolerance" className="block text-white/80 text-sm mb-3">
                Tolérance au piment (0-3)
              </label>
              <div className="space-y-2">
                <input
                  {...register('sensoryPreferences.spiceTolerance', { valueAsNumber: true })}
                  type="range"
                  id="sensoryPreferences.spiceTolerance"
                  min="0"
                  max="3"
                  step="1"
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #22C55E 0%, #F59E0B 33%, #EF4444 66%, #DC2626 100%
                    )`
                  }}
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>Aucun</span>
                  <span>Doux</span>
                  <span>Moyen</span>
                  <span>Fort</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-3">
                Textures à éviter
              </label>
              <ArrayItemManager
                items={watchedValues.sensoryPreferences?.textureAversions || []}
                newItem={newTextureAversion}
                setNewItem={setNewTextureAversion}
                onAdd={addTextureAversion}
                onRemove={removeTextureAversion}
                placeholder="Ex: Gélatineux, Granuleux..."
                itemColor="#A855F7"
                itemLabel="texture"
              />
            </div>
          </div>
        </div>
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Préférences"
      />
    </GlassCard>
  );
};