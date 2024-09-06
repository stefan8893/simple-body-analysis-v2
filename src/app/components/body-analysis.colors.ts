const documentStyle = getComputedStyle(document.documentElement);
export const primaryColor = documentStyle.getPropertyValue('--primary-color');
export const weightColor = primaryColor;
export const muscleMassColor = documentStyle.getPropertyValue('--purple-700');
export const bodyFatColor = documentStyle.getPropertyValue('--orange-500');
export const bodyWaterColor = documentStyle.getPropertyValue('--cyan-500');
