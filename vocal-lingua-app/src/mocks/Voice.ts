// Stub for @react-native-voice/voice used in Expo Go preview.
// All methods are no-ops; voice recognition requires a development build.
const Voice = {
  onSpeechStart: null as any,
  onSpeechEnd: null as any,
  onSpeechPartialResults: null as any,
  onSpeechResults: null as any,
  onSpeechError: null as any,
  start: async (_lang: string) => {},
  stop: async () => {},
  destroy: async () => {},
  removeAllListeners: () => {},
  isAvailable: async () => 0,
};
export default Voice;
