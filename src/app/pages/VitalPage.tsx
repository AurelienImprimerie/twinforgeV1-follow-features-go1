import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../ui/page/PageHeader';
import GlassCard from '../../ui/cards/GlassCard';
import { ICONS } from '../../ui/icons/registry';
import SpatialIcon from '../../ui/icons/SpatialIcon';

/**
 * Forge Vitale - Page Placeholder Premium
 * Hub de santé intelligent et médecine préventive personnalisée
 * Disponible après obtention du CE (Marquage de Conformité Européenne)
 */
const VitalPage: React.FC = () => {
  const features = [
    {
      icon: 'FileText' as const,
      title: 'Dossier Médical Unifié',
      description: 'Centralisez tous vos documents de santé, analyses, prescriptions et historiques médicaux dans un espace sécurisé conforme RGPD.',
      color: '#EF4444'
    },
    {
      icon: 'Activity' as const,
      title: 'Analyse Biologique Avancée',
      description: 'Upload et analyse automatique de vos bilans sanguins avec détection de tendances, alertes précoces et recommandations personnalisées.',
      color: '#F59E0B'
    },
    {
      icon: 'TrendingUp' as const,
      title: 'Suivi Longitudinal Intelligent',
      description: 'Suivez l\'évolution de tous vos marqueurs de santé dans le temps avec visualisations interactives et prédictions basées sur l\'IA.',
      color: '#10B981'
    },
    {
      icon: 'Shield' as const,
      title: 'Médecine Préventive',
      description: 'Détection précoce de risques de santé basée sur vos données, génétique, habitudes de vie et facteurs environnementaux.',
      color: '#06B6D4'
    },
    {
      icon: 'Pill' as const,
      title: 'Gestion des Traitements',
      description: 'Suivi de vos médicaments, rappels de prises, interactions médicamenteuses et effets secondaires documentés.',
      color: '#8B5CF6'
    },
    {
      icon: 'Users' as const,
      title: 'Partage Médecin-Patient',
      description: 'Partagez de manière sécurisée vos données de santé avec vos professionnels de santé pour un suivi optimal et collaboratif.',
      color: '#EC4899'
    },
  ];

  const stats = [
    { label: 'Analyses Traitées', value: '10M+', sublabel: 'par an' },
    { label: 'Marqueurs Suivis', value: '200+', sublabel: 'biomarqueurs' },
    { label: 'Certifications', value: 'CE + RGPD', sublabel: 'conformité EU' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 w-full"
    >
      <PageHeader
        icon="HeartPulse"
        title="Forge Vitale"
        subtitle="Hub de Santé Intelligent & Médecine Préventive"
        circuit="vital"
        iconColor="#EF4444"
      />

      {/* Hero Card - Vision Premium */}
      <GlassCard className="p-8 md:p-10">
        <div className="space-y-6">
          {/* Badge Status */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.1))',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <SpatialIcon Icon={ICONS.Sparkles} size={20} style={{ color: '#EF4444' }} />
              <span className="font-semibold text-white text-sm tracking-wide">
                Disponible Prochainement
              </span>
              <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            </motion.div>
          </div>

          {/* Main Title & Description */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Votre Hub de Santé Intelligent
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/80 leading-relaxed"
            >
              La Forge Vitale sera votre compagnon santé complet, combinant médecine préventive de pointe,
              analyses biologiques avancées et suivi longitudinal intelligent. Un véritable hub médical
              personnel conforme aux normes européennes les plus strictes.
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 md:gap-6 py-6"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/70 font-medium">
                  {stat.label}
                </div>
                <div className="text-xxs md:text-xs text-white/50 mt-1">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </GlassCard>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <GlassCard className="p-6 h-full hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}18)`,
                    border: `1.5px solid ${feature.color}40`,
                    boxShadow: `0 0 24px ${feature.color}20`
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS[feature.icon]}
                    size={24}
                    style={{
                      color: feature.color,
                      filter: `drop-shadow(0 0 8px ${feature.color}60)`
                    }}
                  />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Certification & Compliance Card */}
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)'
              }}
            >
              <SpatialIcon
                Icon={ICONS.Shield}
                size={28}
                style={{
                  color: '#10B981',
                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                Conformité & Sécurité Maximale
              </h3>
              <p className="text-white/70 leading-relaxed">
                La Forge Vitale sera déployée après obtention du marquage CE dispositif médical,
                garantissant la conformité aux standards européens les plus stricts en matière de
                sécurité, fiabilité et protection des données de santé (RGPD, HDS).
              </p>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap gap-3">
            {['CE Médical', 'RGPD Compliant', 'ISO 27001', 'HDS Certifié'].map((badge) => (
              <div
                key={badge}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/90"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Call to Action */}
      <GlassCard className="p-8 text-center">
        <div className="space-y-4 max-w-2xl mx-auto">
          <SpatialIcon
            Icon={ICONS.Rocket}
            size={48}
            className="mx-auto"
            style={{
              color: '#F59E0B',
              filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))'
            }}
          />
          <h3 className="text-2xl font-bold text-white">
            Restez Informé du Lancement
          </h3>
          <p className="text-white/70 leading-relaxed">
            Nous travaillons activement sur l'obtention des certifications nécessaires pour vous offrir
            le hub de santé le plus avancé et sécurisé du marché. Suivez nos actualités pour être parmi
            les premiers à découvrir la Forge Vitale.
          </p>
          <div className="pt-2">
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.15))',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                color: 'white',
                cursor: 'not-allowed',
                opacity: 0.8
              }}
            >
              <SpatialIcon Icon={ICONS.Clock} size={18} />
              En développement
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default VitalPage;
