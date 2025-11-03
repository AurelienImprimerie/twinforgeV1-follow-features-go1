import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../../system/supabase/client';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface WearableConnectionBadgeProps {
  activityId?: string;
  className?: string;
  showDetails?: boolean;
}

interface EnrichmentInfo {
  isEnriched: boolean;
  deviceProvider?: string;
  fieldsEnriched?: string[];
  syncedAt?: string;
  dataPoints?: number;
}

const WearableConnectionBadge: React.FC<WearableConnectionBadgeProps> = ({
  activityId,
  className = '',
  showDetails = false
}) => {
  const { data: enrichmentInfo, isLoading } = useQuery<EnrichmentInfo>({
    queryKey: ['activity-enrichment', activityId],
    queryFn: async () => {
      if (!activityId) {
        const { data: devices } = await supabase
          .from('connected_devices')
          .select('id, provider, status')
          .eq('status', 'connected')
          .limit(1);

        return {
          isEnriched: false,
          hasConnectedDevices: devices && devices.length > 0
        };
      }

      const { data: activity } = await supabase
        .from('activities')
        .select('wearable_device_id, wearable_synced_at, wearable_raw_data')
        .eq('id', activityId)
        .single();

      if (!activity || !activity.wearable_device_id) {
        return { isEnriched: false };
      }

      const { data: device } = await supabase
        .from('connected_devices')
        .select('provider, display_name')
        .eq('id', activity.wearable_device_id)
        .single();

      const fieldsEnriched = activity.wearable_raw_data
        ? Object.keys(activity.wearable_raw_data)
        : [];

      return {
        isEnriched: true,
        deviceProvider: device?.provider || 'unknown',
        deviceName: device?.display_name,
        fieldsEnriched,
        syncedAt: activity.wearable_synced_at,
        dataPoints: fieldsEnriched.length
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
        style={{
          background: 'color-mix(in srgb, var(--color-activity-secondary) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-activity-secondary) 20%, transparent)',
          color: 'var(--color-activity-secondary)'
        }}
      >
        <div className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--color-activity-secondary)' }}
        />
        Vérification...
      </div>
    );
  }

  if (!enrichmentInfo?.isEnriched && !enrichmentInfo?.hasConnectedDevices) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
        style={{
          background: 'color-mix(in srgb, #64748B 10%, transparent)',
          border: '1px solid color-mix(in srgb, #64748B 20%, transparent)',
          color: '#94A3B8'
        }}
      >
        <SpatialIcon Icon={ICONS.WifiOff} size={12} style={{ color: '#94A3B8' }} />
        Aucun objet connecté
      </div>
    );
  }

  if (!enrichmentInfo?.isEnriched && enrichmentInfo?.hasConnectedDevices) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
        style={{
          background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
          border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)',
          color: '#FCD34D'
        }}
      >
        <SpatialIcon Icon={ICONS.Clock} size={12} style={{ color: '#FCD34D' }} />
        En attente de données
      </div>
    );
  }

  const providerColors: Record<string, string> = {
    strava: '#FC4C02',
    apple_health: '#FF3B30',
    google_fit: '#4285F4',
    garmin: '#007CC3',
    fitbit: '#00B0B9',
    polar: '#E30613',
    wahoo: '#2E3192',
    whoop: '#000000',
    oura: '#5E17EB',
    suunto: '#FF3B3F',
    coros: '#FF6B00'
  };

  const providerNames: Record<string, string> = {
    strava: 'Strava',
    apple_health: 'Apple Health',
    google_fit: 'Google Fit',
    garmin: 'Garmin',
    fitbit: 'Fitbit',
    polar: 'Polar',
    wahoo: 'Wahoo',
    whoop: 'WHOOP',
    oura: 'Oura',
    suunto: 'Suunto',
    coros: 'COROS'
  };

  const providerColor = providerColors[enrichmentInfo.deviceProvider || 'unknown'] || '#22C55E';
  const providerName = providerNames[enrichmentInfo.deviceProvider || 'unknown'] || 'Objet Connecté';

  return (
    <div className={className}>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: `color-mix(in srgb, ${providerColor} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${providerColor} 25%, transparent)`,
          color: providerColor
        }}
      >
        <div className="relative">
          <SpatialIcon Icon={ICONS.Watch} size={12} style={{ color: providerColor }} />
          <div
            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: providerColor }}
          />
        </div>
        <span>Enrichi par {providerName}</span>
      </div>

      {showDetails && enrichmentInfo.dataPoints && enrichmentInfo.dataPoints > 0 && (
        <div
          className="mt-2 text-xs px-3 py-2 rounded-lg"
          style={{
            background: `color-mix(in srgb, ${providerColor} 6%, transparent)`,
            border: `1px solid color-mix(in srgb, ${providerColor} 15%, transparent)`,
            color: `color-mix(in srgb, ${providerColor} 90%, white)`
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <SpatialIcon Icon={ICONS.Activity} size={10} style={{ color: providerColor }} />
            <span className="font-medium">Données synchronisées</span>
          </div>
          <div className="ml-4 space-y-0.5 text-[10px]" style={{
            color: `color-mix(in srgb, ${providerColor} 70%, white)`
          }}>
            {enrichmentInfo.fieldsEnriched?.includes('heart_rate') && (
              <div>• Fréquence cardiaque</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('calories') && (
              <div>• Calories brûlées</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('distance') && (
              <div>• Distance parcourue</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('elevation') && (
              <div>• Dénivelé</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('cadence') && (
              <div>• Cadence</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('power') && (
              <div>• Puissance</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('vo2max') && (
              <div>• VO2max estimée</div>
            )}
            {enrichmentInfo.fieldsEnriched?.includes('hrv') && (
              <div>• Variabilité cardiaque (HRV)</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WearableConnectionBadge;
