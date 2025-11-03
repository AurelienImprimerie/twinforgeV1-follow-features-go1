# Politique de Conservation des Données - TwinForge

## Vue d'Ensemble

TwinForge implémente un système de conservation des données conçu spécifiquement pour la **médecine préventive** et le **coaching personnalisé à long terme**. Cette politique garantit que toutes les données critiques de santé et d'entraînement sont conservées de façon permanente, permettant un suivi longitudinal sur plusieurs années.

## Philosophie

> **"Vos données de santé sont précieuses. Nous les conservons de façon permanente pour vous permettre de bénéficier d'un suivi médical préventif optimal et d'un coaching adapté à votre évolution réelle sur le long terme."**

### Principes Fondamentaux

1. **Conservation permanente des données critiques de santé**
2. **Suppression logique plutôt que physique** (soft delete)
3. **Archivage intelligent et optimisé** pour le stockage longue durée
4. **Transparence totale** sur les données conservées
5. **Restauration possible** des données supprimées par erreur
6. **Conformité RGPD** avec droit à l'oubli tout en conservant l'historique médical

## Catégories de Rétention

### 1. Critical Permanent (Conservation Infinie)

**Objectif**: Dossier médical et historique de santé complet pour médecine préventive.

**Tables concernées**:
- `user_profile` (profil complet incluant données de santé)
- `user_health_history` (historique des constantes vitales et données médicales)
- `health_timeline` (ligne de temps chronologique de tous les événements de santé)

**Durée**: **Infinie** tant que le compte utilisateur est actif

**Archivage**: Après 2 ans, migration vers stockage optimisé avec compression

**Snapshots**: Automatiques quotidiens

**Justification**:
- Détection précoce de pathologies via analyse longitudinale
- Suivi de l'évolution des marqueurs de santé sur années
- Historique médical complet pour professionnels de santé
- Prévention basée sur tendances long terme

### 2. Important Longterm (Conservation 2-10 ans)

**Objectif**: Historique d'activité pour coaching adaptatif et progression.

**Tables concernées**:
- `training_sessions` (10 ans) - sessions d'entraînement complètes
- `training_exercises` (10 ans) - détails des exercices réalisés
- `activities` (10 ans) - activités physiques quotidiennes
- `training_feedback` (6 ans) - feedbacks utilisateur
- `training_adaptations` (5 ans) - historique des adaptations de programme
- `ai_analysis_jobs` (5 ans) - analyses IA et métriques de qualité

**Durée**: Entre 5 et 10 ans selon le type

**Archivage**: Après 2 ans pour sessions/exercices, 1 an pour analyses

**Snapshots**: Hebdomadaires

**Justification**:
- Analyse de progression sur plusieurs années
- Détection de patterns d'entraînement
- Calcul de charge cumulée et récupération
- Optimisation continue du coaching IA
- Identification de périodes de performance optimale

### 3. Standard Midterm (Conservation 2 ans)

**Objectif**: Données fonctionnelles avec valeur historique modérée.

**Tables concernées**:
- `training_plans` (2 ans) - plans d'entraînement passés
- `connected_devices` (2 ans) - historique des appareils connectés

**Durée**: 2 ans

**Archivage**: Après 1 an

**Snapshots**: Non automatiques

**Justification**:
- Référence historique pour comprendre progression
- Données de diagnostic en cas de problème
- Conservation raisonnable sans surcharge de stockage

### 4. Temporary (Conservation 30-90 jours)

**Objectif**: Données temporaires et caches pour performance.

**Tables concernées**:
- `geographic_data_cache` (90 jours) - cache météo et géolocalisation
- `ai_trend_analyses` (90 jours) - cache analyses de tendances
- `training_session_states` (30 jours) - états temporaires de sessions
- `notification_history` (90 jours pour non-importantes)

**Durée**: 30 à 90 jours

**Archivage**: Les données géographiques sont archivées avant suppression

**Snapshots**: Non

**Justification**:
- Données de cache sans valeur historique
- Régénérables à la demande
- Optimisation de la performance et du coût de stockage

## Système de Soft Delete

### Principe

Au lieu de supprimer physiquement les données critiques, nous les marquons comme `soft_deleted = true`. Cela permet:

1. **Protection contre suppression accidentelle**
2. **Possibilité de restauration** pendant une période définie
3. **Conservation de l'historique** pour analyses
4. **Audit complet** de toutes les suppressions

### Colonnes Ajoutées

Toutes les tables avec soft delete ont:
```sql
soft_deleted boolean DEFAULT false
deleted_at timestamptz
deletion_reason text
can_be_restored boolean DEFAULT true
retention_category text
```

### Utilisation

**Pour supprimer des données**:
```sql
-- ❌ NE PAS FAIRE (bloqué par trigger)
DELETE FROM activities WHERE id = 'xxx';

-- ✅ FAIRE (soft delete)
SELECT safe_soft_delete('activities', 'xxx'::uuid, 'user_request');
```

**Pour restaurer des données**:
```sql
SELECT restore_soft_deleted('activities', 'xxx'::uuid, 'accidental_deletion');
```

## Système d'Archivage

### Archives Automatiques

Le système archive automatiquement les données anciennes selon leur catégorie:

1. **Compression JSONB**: Réduction de 60-80% de l'espace
2. **Stockage optimisé**: Migration vers tables d'archivage partitionnées
3. **Index adaptatifs**: Optimisés pour requêtes historiques rares
4. **Intégrité garantie**: Checksums et vérifications périodiques

### Table d'Archivage

```sql
CREATE TABLE archived_user_data (
  id uuid PRIMARY KEY,
  user_id uuid,
  archive_type text,
  archive_period_start timestamptz,
  archive_period_end timestamptz,
  archived_data jsonb,  -- Données compressées
  data_summary jsonb,   -- Résumé pour accès rapide
  compression_ratio numeric,
  ...
)
```

### Accès aux Archives

Les données archivées restent accessibles mais avec une latence légèrement supérieure. L'interface utilisateur affiche automatiquement les données actives et archivées de façon transparente.

## Health Timeline - Suivi Longitudinal

### Concept

La `health_timeline` est une table centrale qui enregistre **tous** les événements de santé dans l'ordre chronologique:

- Mises à jour du profil santé
- Scans corporels complétés
- Constantes vitales enregistrées
- Blessures signalées
- Changements de poids/composition corporelle
- Événements médicaux importants

### Snapshots Automatiques

**Quotidiens**: Snapshot complet du profil santé à 3h00 du matin

**Déclenchés**: À chaque modification importante du profil

**Conservation**: Permanente, compressée après 1 an

### Utilisation pour Médecine Préventive

L'historique complet permet:

1. **Détection de tendances**: Identification de dégradations progressives
2. **Alertes prédictives**: Détection précoce de risques (ex: prise de poids rapide)
3. **Corrélations**: Lien entre événements (blessure → baisse performance)
4. **Rapports médicaux**: Export complet pour professionnels de santé

## Audit et Traçabilité

### Deletion Audit Log

Toutes les tentatives de suppression sont loggées dans `deletion_audit_log`:

```sql
CREATE TABLE deletion_audit_log (
  id uuid PRIMARY KEY,
  table_name text,
  record_id uuid,
  user_id uuid,
  deletion_type text,  -- soft, hard, cascade, blocked
  initiated_by uuid,
  success boolean,
  record_snapshot jsonb,  -- Snapshot avant suppression
  created_at timestamptz
)
```

### Monitoring

Vue de monitoring accessible aux administrateurs:

```sql
SELECT * FROM v_deletion_monitoring;
```

Affiche:
- Nombre de suppressions par table
- Tentatives bloquées
- Patterns suspects
- Statistiques sur 30 jours

## Protection Contre les Cascades

### Problème

Les contraintes `ON DELETE CASCADE` peuvent entraîner des suppressions massives accidentelles de données critiques.

### Solution Implémentée

1. **Triggers de protection**: Bloquent les suppressions physiques sur données critiques
2. **Audit des cascades**: Fonction `identify_dangerous_cascades()` pour analyse
3. **Recommandations**: Identification automatique des contraintes à modifier

### Vérification

Pour voir les contraintes CASCADE dangereuses:

```sql
SELECT * FROM identify_dangerous_cascades()
WHERE risk_level IN ('CRITICAL', 'HIGH');
```

## Fonctions de Nettoyage Modifiées

### Avant

Les fonctions de cleanup supprimaient définitivement les données:
- `cleanup_old_notification_history()` → supprimait toutes notifications > 90j
- `cleanup_expired_data_exports()` → supprimait exports expirés
- `cleanup_expired_geographic_data()` → supprimait cache expiré

### Maintenant

Les fonctions sont modifiées pour:
- **Notifications**: Garder indéfiniment les notifications importantes (training, santé)
- **Exports**: Marquer comme "expired" au lieu de supprimer
- **Geo Data**: Archiver dans `geographic_data_history` avant suppression

## Dashboard Utilisateur - Transparence

### Vue de Rétention

Les utilisateurs peuvent voir via `get_user_data_retention_summary()`:

```json
{
  "health_timeline_events": 1247,
  "training_sessions_total": 342,
  "activities_total": 1856,
  "oldest_health_record": "2023-01-15T08:00:00Z",
  "oldest_activity": "2023-01-20T06:30:00Z",
  "data_span_days": 653,
  "archived_data_count": 12,
  "retention_policies": [...]
}
```

### Export Complet

À tout moment, l'utilisateur peut:
1. Demander un export complet de toutes ses données
2. Télécharger ses archives historiques
3. Voir exactement quelles données sont conservées
4. Comprendre pourquoi (base légale, objectif médical)

## Conformité RGPD

### Droits Respectés

✅ **Droit d'accès**: Export complet disponible
✅ **Droit de rectification**: Modification libre des données
✅ **Droit à l'oubli**: Soft delete avec archivage
✅ **Droit à la portabilité**: Export format JSON/CSV
✅ **Droit d'opposition**: Possibilité de refuser certains traitements
✅ **Transparence**: Documentation complète accessible

### Base Légale

La conservation longue durée est justifiée par:

1. **Intérêt légitime**: Médecine préventive et coaching optimisé
2. **Exécution du contrat**: Service de coaching nécessite historique
3. **Obligation légale**: Dossier médical (cas professionnel de santé)
4. **Consentement éclairé**: Utilisateur informé et accepte conservation

### Suppression de Compte

Lors de la suppression de compte:
1. **Période de grâce**: 90 jours avant suppression définitive
2. **Anonymisation**: Les données peuvent être anonymisées pour études
3. **Suppression complète**: Possible sur demande explicite
4. **Export final**: Proposé automatiquement avant suppression

## Performance et Coûts

### Optimisations

1. **Compression JSONB**: -60% à -80% d'espace
2. **Partitionnement**: Tables archivées par année
3. **Index adaptatifs**: Seulement sur données actives
4. **Requêtes optimisées**: Cache en mémoire pour données fréquentes

### Estimation Coûts

Pour un utilisateur actif sur 5 ans:

- **Données actives**: ~50 MB (accès rapide)
- **Archives compressées**: ~200 MB (accès lent)
- **Snapshots**: ~100 MB (stockage optimisé)
- **Total**: ~350 MB par utilisateur sur 5 ans

**Coût estimé**: 0.02€/mois/utilisateur pour stockage Supabase

### Scaling

Le système est conçu pour:
- 100K+ utilisateurs actifs
- 10+ ans d'historique par utilisateur
- Milliers de requêtes historiques par jour
- Croissance linéaire des coûts

## Maintenance et Monitoring

### Tâches Automatiques

Configurées via cron ou scheduled functions:

1. **Quotidien** (3h00): Snapshots santé automatiques
2. **Hebdomadaire** (dimanche 2h00): Archivage données anciennes
3. **Mensuel** (1er jour 1h00): Vérification intégrité archives
4. **Trimestriel**: Analyse contraintes CASCADE, rapport compliance

### Alertes

Monitoring actif sur:
- Tentatives suppression massive (>100 records/jour)
- Échecs d'archivage
- Croissance anormale de la base
- Corruptions de checksums

### Dashboards Admin

Métriques disponibles:
- Volume données par catégorie
- Taux compression archives
- Distribution rétention utilisateurs
- Coûts stockage par période

## Migration et Transition

### Données Existantes

Cette politique s'applique **uniquement aux nouvelles données** à partir du déploiement.

Les données existantes:
- Conservent leur comportement actuel
- Peuvent être migrées progressivement
- Bénéficient des protections soft delete dès maintenant

### Adoption Progressive

1. **Phase 1** (actuelle): Infrastructure en place, soft delete activé
2. **Phase 2** (T+1 mois): Migration données anciennes importantes
3. **Phase 3** (T+3 mois): Archivage automatique activé
4. **Phase 4** (T+6 mois): Analyse complète et optimisations

## Questions Fréquentes

### Q: Que devient mon historique si je supprime mon compte?

**R**: Période de grâce de 90 jours. Ensuite, vous choisissez entre suppression complète ou anonymisation pour recherche médicale (opt-in).

### Q: Puis-je supprimer définitivement certaines données?

**R**: Oui, via soft delete puis demande explicite. Délai de restauration de 30 jours pour données critiques, 7 jours pour autres.

### Q: Les données archivées sont-elles accessibles?

**R**: Oui, complètement accessibles via l'interface. Légèrement plus lent (quelques secondes vs millisecondes).

### Q: Combien coûte le stockage de mes données?

**R**: Inclus dans l'abonnement. Coût marginal pour nous: ~0.02€/mois/utilisateur.

### Q: Mes données sont-elles sécurisées?

**R**: Oui. Chiffrement en transit et au repos, accès strictement contrôlé par RLS, audit complet, backups quotidiens.

### Q: Puis-je exporter toutes mes données?

**R**: Oui, à tout moment, format JSON ou CSV, incluant archives historiques.

### Q: Les données supprimées par erreur peuvent-elles être récupérées?

**R**: Oui, via soft delete. Délai: 30 jours pour données critiques, 7 jours pour autres. Support peut aider à la restauration.

## Support et Contact

Pour questions sur la politique de rétention:
- **Email**: privacy@twinforge.app
- **Documentation**: https://twinforge.app/docs/privacy
- **Support**: Via l'application, section Aide

---

**Dernière mise à jour**: 20 octobre 2025
**Version**: 1.0.0
**Prochaine révision**: 20 janvier 2026
