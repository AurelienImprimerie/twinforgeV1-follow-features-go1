/**
 * VaccinationsSection Component
 * Smart vaccination tracking synchronized with country health data
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { VaccinationRecord, CountryHealthData } from '../../../../domain/health';

interface VaccinationsSectionProps {
  vaccinations: VaccinationRecord[];
  countryData: CountryHealthData | null;
  onAddVaccination: (vaccination: VaccinationRecord) => void;
  onUpdateVaccination: (index: number, vaccination: VaccinationRecord) => void;
  onRemoveVaccination: (index: number) => void;
  onToggleUpToDate: (checked: boolean) => void;
  upToDate: boolean;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

export const VaccinationsSection: React.FC<VaccinationsSectionProps> = ({
  vaccinations,
  countryData,
  onAddVaccination,
  onUpdateVaccination,
  onRemoveVaccination,
  onToggleUpToDate,
  upToDate,
  onSave,
  isSaving,
  isDirty,
}) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newVaccineName, setNewVaccineName] = React.useState('');
  const [newVaccineDate, setNewVaccineDate] = React.useState('');
  const [newVaccineNextDue, setNewVaccineNextDue] = React.useState('');

  // Get recommended vaccines from country data
  const recommendedVaccines = React.useMemo(() => {
    if (!countryData?.vaccination_requirements) return [];

    const required = countryData.vaccination_requirements.required || [];
    const recommended = countryData.vaccination_requirements.recommended || [];

    return [...new Set([...required, ...recommended])];
  }, [countryData]);

  // Check vaccination status
  const getVaccineStatus = (vaccineName: string) => {
    const vaccine = vaccinations.find(v =>
      v.name.toLowerCase() === vaccineName.toLowerCase()
    );

    if (!vaccine) return 'missing';

    if (vaccine.next_due) {
      const nextDue = new Date(vaccine.next_due);
      const today = new Date();

      if (nextDue < today) return 'overdue';

      const daysUntilDue = Math.floor((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 90) return 'due_soon';
    }

    return 'up_to_date';
  };

  const handleAddVaccination = () => {
    if (!newVaccineName || !newVaccineDate) return;

    const newVaccination: VaccinationRecord = {
      name: newVaccineName,
      date: newVaccineDate,
      next_due: newVaccineNextDue || undefined,
      required: recommendedVaccines.some(v => v.toLowerCase() === newVaccineName.toLowerCase()),
    };

    onAddVaccination(newVaccination);
    setNewVaccineName('');
    setNewVaccineDate('');
    setNewVaccineNextDue('');
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up_to_date': return { bg: 'bg-green-500/10', border: 'border-green-400/20', text: 'text-green-300', dot: 'bg-green-400' };
      case 'due_soon': return { bg: 'bg-yellow-500/10', border: 'border-yellow-400/20', text: 'text-yellow-300', dot: 'bg-yellow-400' };
      case 'overdue': return { bg: 'bg-red-500/10', border: 'border-red-400/20', text: 'text-red-300', dot: 'bg-red-400' };
      default: return { bg: 'bg-gray-500/10', border: 'border-gray-400/20', text: 'text-gray-300', dot: 'bg-gray-400' };
    }
  };

  // Calculate overall vaccination status
  const overallStatus = React.useMemo(() => {
    if (recommendedVaccines.length === 0) return 'unknown';

    const statuses = recommendedVaccines.map(getVaccineStatus);

    if (statuses.some(s => s === 'overdue')) return 'overdue';
    if (statuses.some(s => s === 'due_soon')) return 'due_soon';
    if (statuses.some(s => s === 'missing')) return 'incomplete';

    return 'complete';
  }, [recommendedVaccines, vaccinations]);

  const overallStatusColor = {
    complete: { color: '#10B981', label: 'À jour', icon: ICONS.CheckCircle },
    incomplete: { color: '#F59E0B', label: 'Incomplet', icon: ICONS.AlertCircle },
    due_soon: { color: '#F59E0B', label: 'Rappels à prévoir', icon: ICONS.Clock },
    overdue: { color: '#EF4444', label: 'En retard', icon: ICONS.AlertTriangle },
    unknown: { color: '#6B7280', label: 'Non défini', icon: ICONS.Info },
  }[overallStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(239, 68, 68, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.2))
                `,
                border: '2px solid rgba(239, 68, 68, 0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              }}
            >
              <SpatialIcon Icon={ICONS.Shield} size={24} style={{ color: '#EF4444' }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">Vaccinations</h3>
              <p className="text-white/60 text-sm mt-1">
                {countryData
                  ? `Recommandations pour ${countryData.country_name}`
                  : 'Gestion de vos vaccinations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: overallStatusColor.color,
                boxShadow: `0 0 8px ${overallStatusColor.color}66`,
              }}
            />
            <span className="text-white/80 text-sm font-medium">{overallStatusColor.label}</span>
          </div>
        </div>

        {/* Quick Status Toggle */}
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={upToDate}
              onChange={(e) => onToggleUpToDate(e.target.checked)}
              className="glass-checkbox"
            />
            <div className="flex-1">
              <span className="text-white/90 font-medium text-sm group-hover:text-white transition-colors">
                Mes vaccinations sont à jour
              </span>
              <p className="text-white/50 text-xs mt-0.5">
                Cochez si tous vos vaccins obligatoires et recommandés sont à jour
              </p>
            </div>
          </label>
        </div>

        {/* Recommended Vaccines List */}
        {recommendedVaccines.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white/90 font-medium text-sm mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.MapPin} size={16} className="text-cyan-400" />
              Vaccins recommandés dans votre pays
            </h4>
            <div className="space-y-2">
              {recommendedVaccines.map((vaccine, index) => {
                const status = getVaccineStatus(vaccine);
                const colors = getStatusColor(status);
                const vaccineRecord = vaccinations.find(v =>
                  v.name.toLowerCase() === vaccine.toLowerCase()
                );

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{vaccine}</div>
                          {vaccineRecord && (
                            <div className="text-white/50 text-xs mt-0.5">
                              Dernière dose: {new Date(vaccineRecord.date).toLocaleDateString('fr-FR')}
                              {vaccineRecord.next_due && ` • Prochain rappel: ${new Date(vaccineRecord.next_due).toLocaleDateString('fr-FR')}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'missing' && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewVaccineName(vaccine);
                              setShowAddForm(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 transition-colors"
                          >
                            <span className={`text-xs ${colors.text}`}>Ajouter</span>
                          </button>
                        )}
                        {status === 'overdue' && (
                          <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
                            Rappel en retard
                          </span>
                        )}
                        {status === 'due_soon' && (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-300">
                            Rappel bientôt
                          </span>
                        )}
                        {status === 'up_to_date' && (
                          <SpatialIcon Icon={ICONS.Check} size={16} className="text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Vaccinations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white/90 font-medium text-sm">Vaccinations additionnelles</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <SpatialIcon Icon={showAddForm ? ICONS.X : ICONS.Plus} size={14} />
              {showAddForm ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-xs mb-2">Nom du vaccin *</label>
                    <input
                      type="text"
                      value={newVaccineName}
                      onChange={(e) => setNewVaccineName(e.target.value)}
                      className="glass-input text-sm"
                      placeholder="Ex: COVID-19, Tétanos, Grippe..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 text-xs mb-2">Date d'administration *</label>
                      <input
                        type="date"
                        value={newVaccineDate}
                        onChange={(e) => setNewVaccineDate(e.target.value)}
                        className="glass-input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-xs mb-2">Prochain rappel</label>
                      <input
                        type="date"
                        value={newVaccineNextDue}
                        onChange={(e) => setNewVaccineNextDue(e.target.value)}
                        className="glass-input text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVaccination}
                    disabled={!newVaccineName || !newVaccineDate}
                    className="btn-glass w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SpatialIcon Icon={ICONS.Plus} size={14} className="inline mr-2" />
                    Ajouter la vaccination
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Vaccinations List */}
          {vaccinations.filter(v =>
            !recommendedVaccines.some(rv => rv.toLowerCase() === v.name.toLowerCase())
          ).length > 0 && (
            <div className="space-y-2">
              {vaccinations
                .filter(v => !recommendedVaccines.some(rv => rv.toLowerCase() === v.name.toLowerCase()))
                .map((vaccine, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{vaccine.name}</div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {new Date(vaccine.date).toLocaleDateString('fr-FR')}
                        {vaccine.next_due && ` • Rappel: ${new Date(vaccine.next_due).toLocaleDateString('fr-FR')}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveVaccination(vaccinations.indexOf(vaccine))}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <SpatialIcon Icon={ICONS.Trash2} size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {vaccinations.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-white/50 text-sm">
              <SpatialIcon Icon={ICONS.Shield} size={32} className="mx-auto mb-2 opacity-50" />
              <p>Aucune vaccination enregistrée</p>
              <p className="text-xs mt-1">Ajoutez vos vaccinations pour un suivi complet</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-end mt-6"
            >
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="btn-glass px-6 py-2.5 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <SpatialIcon Icon={ICONS.Loader2} size={16} className="animate-spin" />
                  ) : (
                    <SpatialIcon Icon={ICONS.Save} size={16} />
                  )}
                  <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
          <div className="flex items-start gap-2">
            <SpatialIcon Icon={ICONS.Info} size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/70 text-xs leading-relaxed">
              Les vaccinations recommandées sont basées sur votre pays de résidence. Consultez votre médecin pour un calendrier vaccinal personnalisé.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
