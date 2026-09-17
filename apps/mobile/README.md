# MINIFY MARKET mobile app

Cross-platform React Native app for Android and iOS using Expo SDK 57 and Expo Router. It uses the same MINIFY MARKET API and marketplace account system as the web application.

## Development

Set `EXPO_PUBLIC_API_URL` to the API origin ending in `/api`. Android emulator can use `http://10.0.2.2:4000/api`; a physical phone should use a reachable LAN address or the production HTTPS API.

Run from the monorepo root: `pnpm --filter mobile start`.

For release builds use EAS Build after configuring the production bundle identifiers, app icons, signing credentials, push-notification credentials and production API URL.
