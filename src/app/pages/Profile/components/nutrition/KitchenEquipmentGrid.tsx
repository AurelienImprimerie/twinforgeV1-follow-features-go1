import React from 'react';
import { ICONS } from '../../../../../ui/icons/registry';
import { CheckboxField } from '../shared/CheckboxField';

/**
 * Kitchen Equipment Grid Component
 */
export const KitchenEquipmentGrid: React.FC<{
  register: any;
  watchedValues: any;
}> = ({ register, watchedValues }) => {
  const equipment = [
    { key: 'oven', label: 'Four', icon: ICONS.Flame },
    { key: 'stove', label: 'Plaques', icon: ICONS.Circle },
    { key: 'microwave', label: 'Micro-ondes', icon: ICONS.Zap },
    { key: 'dishwasher', label: 'Lave-vaisselle', icon: ICONS.Droplets },
    { key: 'blender', label: 'Mixeur', icon: ICONS.Zap },
    { key: 'airFryer', label: 'Air Fryer', icon: ICONS.Wind },
    { key: 'slowCooker', label: 'Mijoteuse', icon: ICONS.Clock },
    { key: 'pressureCooker', label: 'Cocotte-minute', icon: ICONS.Timer },
    { key: 'foodProcessor', label: 'Robot', icon: ICONS.Settings },
    { key: 'standMixer', label: 'Batteur', icon: ICONS.RotateCcw },
    { key: 'grill', label: 'Grill', icon: ICONS.Flame },
    { key: 'steamer', label: 'Vapeur', icon: ICONS.Cloud }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {equipment.map(({ key, label, icon }) => (
        <CheckboxField
          key={key}
          register={register}
          name={`kitchenEquipment.${key}`}
          label={label}
          description=""
          checked={watchedValues.kitchenEquipment?.[key] || false}
          color="#06B6D4"
          icon={icon}
          compact
        />
      ))}
    </div>
  );
};