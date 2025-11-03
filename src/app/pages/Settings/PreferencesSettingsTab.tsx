import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useToast } from '../../../ui/components/ToastProvider';
import { useUserStore } from '../../../system/store/userStore';
import type { VoiceType } from '../../../system/store/voiceCoachStore';

const AVAILABLE_VOICES: Array<{
  id: VoiceType;
  name: string;
  description: string;
  personality: string;
  sampleText: string;
  isRecommended?: boolean;
  isNew?: boolean;
}> = [
  // Voix recommandées en premier (les plus optimisées)
  {
    id: 'nova',
    name: 'Nova',
    description: 'Voix dynamique et jeune',
    personality: 'Énergique et moderne',
    sampleText: 'Hey ! Je suis Nova. Ensemble, on va déchirer cet entraînement !',
    isRecommended: true,
    isNew: true
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Voix féminine chaleureuse',
    personality: 'Encourageante et bienveillante',
    sampleText: 'Bonjour, je suis Shimmer. Je suis là pour t\'encourager à chaque étape de ton parcours.',
    isRecommended: true
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Voix masculine dynamique',
    personality: 'Énergique et motivante',
    sampleText: 'Salut ! Je suis Echo. Prêt à donner le meilleur de toi-même ? Allez, on y va !',
    isRecommended: true
  },
  // Autres voix disponibles
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Voix neutre et équilibrée',
    personality: 'Professionnelle, claire et posée',
    sampleText: 'Bonjour, je suis Alloy. Je vous accompagne dans votre entraînement avec une voix claire et professionnelle.'
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'Voix expressive britannique',
    personality: 'Élégante et inspirante',
    sampleText: 'Bonjour, je suis Fable. Laisse-moi t\'accompagner dans ton parcours avec style et élégance.',
    isNew: true
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Voix profonde et posée',
    personality: 'Calme et rassurante',
    sampleText: 'Salut, je suis Onyx. Je t\'accompagne avec calme et détermination vers tes objectifs.',
    isNew: true
  }
];

const PreferencesSettingsTab: React.FC = () => {
  const { profile, updateProfile } = useUserStore();
  const { showToast } = useToast();
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>(
    (profile?.preferences?.voice_coach_voice as VoiceType) || 'alloy'
  );
  const [isPlaying, setIsPlaying] = useState<VoiceType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        // Handle both AudioBufferSourceNode and HTMLAudioElement
        if ('stop' in audioSourceRef.current) {
          audioSourceRef.current.stop();
          audioSourceRef.current.disconnect();
        } else if ('pause' in audioSourceRef.current) {
          (audioSourceRef.current as HTMLAudioElement).pause();
          (audioSourceRef.current as HTMLAudioElement).currentTime = 0;
        }
      } catch (e) {
        // Already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(null);
  };

  const playVoicePreview = async (voiceId: VoiceType) => {
    stopAudio();

    const voice = AVAILABLE_VOICES.find(v => v.id === voiceId);
    if (!voice) return;

    setIsPlaying(voiceId);

    try {
      // Utiliser l'API OpenAI TTS pour un vrai aperçu de la voix
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      showToast({
        type: 'info',
        title: `Aperçu: ${voice.name}`,
        message: 'Génération de l\'aperçu vocal...',
        duration: 2000,
      });

      // Appeler une edge function pour générer l'audio avec OpenAI TTS
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-voice-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          voice: voiceId,
          text: voice.sampleText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice preview');
      }

      // Récupérer l'audio en tant que blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Créer et jouer l'élément audio
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;

      audio.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
        showToast({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la lecture de l\'aperçu',
          duration: 3000,
        });
      };

      await audio.play();
      audioSourceRef.current = audio as any; // Pour permettre l'arrêt

    } catch (error) {
      console.error('Error playing voice preview:', error);
      setIsPlaying(null);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer l\'aperçu audio. Vérifiez votre connexion.',
        duration: 3000,
      });
    }
  };

  const handleVoiceSelect = async (voiceId: VoiceType) => {
    setSelectedVoice(voiceId);
    setIsSaving(true);

    try {
      await updateProfile({
        preferences: {
          ...profile?.preferences,
          voice_coach_voice: voiceId,
        }
      });

      showToast({
        type: 'success',
        title: 'Voix enregistrée',
        message: `${AVAILABLE_VOICES.find(v => v.id === voiceId)?.name} sera utilisée pour le coach vocal`,
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder la préférence de voix',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Voix du Coach Vocal
        </h3>
        <p className="text-sm text-slate-400">
          Choisissez la voix qui vous accompagnera pendant vos entraînements.
          Cliquez sur le bouton de lecture pour écouter un aperçu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isCurrentlyPlaying = isPlaying === voice.id;

          return (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
                    : voice.isRecommended
                    ? 'border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-white/5'
                    : 'hover:bg-white/5'
                } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !isSaving && handleVoiceSelect(voice.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <SpatialIcon
                      Icon={ICONS.Mic}
                      size={24}
                      color={isSelected ? '#18E3FF' : voice.isRecommended ? '#18E3FF' : '#60A5FA'}
                      variant="pure"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-white">
                          {voice.name}
                        </h4>
                        {voice.isNew && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                            Nouveau
                          </span>
                        )}
                        {voice.isRecommended && !voice.isNew && (
                          <span className="text-xs text-cyan-400/70">★</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-cyan-400">
                          <SpatialIcon
                            Icon={ICONS.Check}
                            size={14}
                            color="#18E3FF"
                            variant="pure"
                          />
                          <span>Sélectionnée</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mb-2">
                      {voice.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <SpatialIcon
                        Icon={ICONS.Sparkles}
                        size={12}
                        color="#94A3B8"
                        variant="pure"
                      />
                      <span>{voice.personality}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentlyPlaying) {
                          stopAudio();
                        } else {
                          playVoicePreview(voice.id);
                        }
                      }}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isCurrentlyPlaying
                          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                      disabled={isSaving}
                    >
                      <SpatialIcon
                        Icon={isCurrentlyPlaying ? ICONS.X : ICONS.Play}
                        size={16}
                        color={isCurrentlyPlaying ? '#18E3FF' : '#FFFFFF'}
                        variant="pure"
                      />
                      <span>
                        {isCurrentlyPlaying ? 'Arrêter l\'aperçu' : 'Écouter un aperçu'}
                      </span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-start gap-3">
          <SpatialIcon
            Icon={ICONS.Info}
            size={20}
            color="#60A5FA"
            variant="pure"
          />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">
              À propos du Coach Vocal
            </h4>
            <ul className="text-xs text-slate-400 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Le coach vocal utilise la technologie OpenAI Realtime pour vous guider en temps réel pendant vos entraînements
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Chaque voix a sa propre personnalité pour s'adapter à votre style d'entraînement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Les aperçus audio sont des simulations. La voix réelle sera utilisée lors de vos séances d'entraînement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Vous pouvez changer de voix à tout moment selon vos préférences
                </span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};

export default PreferencesSettingsTab;
