/**
 * Body Scan Constants
 * URLs and configuration for Body Scan components
 */

export const GENDER_GUIDE_IMAGES = {
  male: {
    front: 'https://kwipydbtjagypocpvbwn.supabase.co/storage/v1/object/public/app-images/homme-face.png',
    profile: 'https://kwipydbtjagypocpvbwn.supabase.co/storage/v1/object/public/app-images/homme-profil.png'
  },
  female: {
    front: 'https://kwipydbtjagypocpvbwn.supabase.co/storage/v1/object/public/app-images/femme-face.png',
    profile: 'https://kwipydbtjagypocpvbwn.supabase.co/storage/v1/object/public/app-images/femme-profil.png'
  }
} as const;

export type UserGender = 'male' | 'female' | 'other' | undefined;

/**
 * Get guide image URL based on gender and photo type
 */
export function getGuideImageUrl(gender: UserGender, type: 'front' | 'profile'): string {
  // Default to male images if gender is not specified or is 'other'
  const genderKey = gender === 'female' ? 'female' : 'male';
  return GENDER_GUIDE_IMAGES[genderKey][type];
}