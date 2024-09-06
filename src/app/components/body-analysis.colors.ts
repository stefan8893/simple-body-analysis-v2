const documentStyle = getComputedStyle(document.documentElement);
export const weightColor = documentStyle.getPropertyValue('--primary-color');
export const muscleMassColor = documentStyle.getPropertyValue('--purple-700');
export const bodyFatColor = documentStyle.getPropertyValue('--orange-500');
export const bodyWaterColor = documentStyle.getPropertyValue('--cyan-500');
