# HairSnap - Hair Loss Tracking App

HairSnap helps users track and monitor hair loss over time with easy photo comparisons, progress tracking, and data visualization. Built with Expo, React Native, and TypeScript.

## Features

- 📷 Take photos of your scalp/hair with consistent positioning guides
- 📊 Track hair density changes over time with visualization
- 🔄 Side-by-side comparison of photos from different dates
- 📅 Scheduling reminders for regular photo check-ins
- 📱 User-friendly interface with intuitive navigation
- 🔒 Private and secure - all data stays on your device

## Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center">
  <img src="./assets/screenshots/home.png" width="200" alt="Home Screen">
  <img src="./assets/screenshots/camera.png" width="200" alt="Camera Screen">
  <img src="./assets/screenshots/progress.png" width="200" alt="Progress Screen">
  <img src="./assets/screenshots/history.png" width="200" alt="History Screen">
</div>

## Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npx expo start
   ```

## Testing

### Unit Tests
Run unit tests with Jest:
```
npm test
```

### E2E Tests
For end-to-end testing with Detox:
1. Install Detox CLI: 
   ```
   npm install -g detox-cli
   ```
2. Build the app for testing:
   ```
   detox build --configuration ios.sim.debug
   ```
3. Run tests:
   ```
   detox test --configuration ios.sim.debug
   ```

## EAS Build and Submission

### Setup EAS CLI
```
npm install -g eas-cli
eas login
```

### Configure the project
```
eas build:configure
```

### Create a preview build
```
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Create a production build
```
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Submit to app stores
```
eas submit -p ios --latest
eas submit -p android --latest
```

## EAS.json Configuration

The project includes an `eas.json` configuration file with different profiles:
- **development**: For local development and testing
- **preview**: For TestFlight/Internal Testing builds
- **production**: For App Store/Play Store submission

Example structure:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "AB12CD34EF"
      },
      "android": {
        "serviceAccountKeyPath": "path/to/service-account.json"
      }
    }
  }
}
```

## Project Structure

```
├── assets/              # Images, fonts, etc.
├── src/
│   ├── components/      # Reusable UI components
│   ├── constants/       # App-wide constants and theme
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── services/        # API and device services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── App.tsx              # App entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or feedback, please contact us at:
- Email: contact@hairsnap-app.com
- Website: https://hairsnap-app.com 