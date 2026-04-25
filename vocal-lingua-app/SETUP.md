# VocalLingua Mobile — Setup

## Requirements
- Node.js 18+
- Xcode (iOS) or Android Studio (Android)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (optional, for device builds): `npm install -g eas-cli`

## Install & Run

```bash
cd vocal-lingua-app
npm install

# Generate native iOS/Android projects (required for @react-native-voice/voice)
npx expo prebuild

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android
```

## API URL
Edit `src/api/index.ts` — change `BASE_URL` based on your environment:

| Environment | URL |
|---|---|
| iOS Simulator | `http://localhost:8000/api` |
| Android Emulator | `http://10.0.2.2:8000/api` |
| Physical device (same WiFi) | `http://<your-computer-ip>:8000/api` |

## Physical Device Build (EAS)
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Permissions
iOS permissions are set in `app.json` (infoPlist). Android permissions are set via the `permissions` array.
Both are applied automatically when you run `expo prebuild`.

## Placeholder Assets
Create these before building:
- `assets/icon.png` — 1024×1024
- `assets/splash.png` — 1284×2778
- `assets/adaptive-icon.png` — 1024×1024 (Android)
