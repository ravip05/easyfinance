// Stub for Capacitor plugins during web builds
export const App = { addListener: () => {}, removeAllListeners: () => {} };
export const Camera = {};
export const CameraSource = {};
export const CameraResultType = {};
export const Filesystem = {};
export const Directory = {};
export const Geolocation = {};
export const Network = { addListener: () => {} };
export const Preferences = { get: async () => null, set: async () => {}, remove: async () => {} };
export const PushNotifications = { addListener: () => {}, requestPermissions: async () => ({ receive: 'denied' }) };
export const Share = {};
export const Capacitor = { isNativePlatform: () => false, getPlatform: () => 'web' };
export const NativeBiometric = {};
export default { App, Camera, Filesystem, Geolocation, Network, Preferences, PushNotifications, Share, Capacitor, NativeBiometric };
