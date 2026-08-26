# 📱 Muzhappilangad Beach Mobile App (React Native / Expo)

Cross-platform mobile application for **Android** and **iOS** built for the **Muzhappilangad Drive-In Beach Management System**.

---

## 🎯 Target Audiences & Workflows

1. **Local Residents**:
   - **Digital Resident Pass**: High-resolution dynamic QR code generated from official Panchayat electoral records.
   - **Emergency SOS Alarm**: 1-tap SOS trigger broadcasting audio siren and live GPS telemetry to gate security.
   - **Beach Services Directory**: Verified Auto & Taxi drivers with 1-tap direct calling, and Restaurants with live food menus (**In-Stock / Sold-Out**).
   - **Visit History Log**: Timestamped gate scan entries.
   - **Incident Reporting**: Submit photos and GPS location of beach hazards.
   - **Trilingual Support**: English, Malayalam (`മലയാളം`), and Hindi (`हिंदी`).

2. **Gate Security Admins**:
   - **High-Speed Camera QR Scanner**: Scans resident and tourist passes with torch and camera flip controls.
   - **Instant Verification Sheet**: Displays resident photo, SEC ID, and status badge with audio chimes.
   - **Visitor Approval Queue**: Real-time approval alerts for arriving tourist vehicles.
   - **Manual Resident Lookup**: Search by Name / SEC ID / Ward for residents without phones on hand.
   - **Incident Progression**: Track and resolve beach reports with Google Maps navigation.
   - **SOS Alarm Dispatch & WebRTC Voice Call**: Receive emergency siren alerts and communicate directly with residents in distress.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd beach-mobile-app
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Run on Devices
- **Android**: Press `a` in terminal or scan QR code in **Expo Go**.
- **iOS**: Press `i` in terminal or scan QR code in **Expo Go**.
- **Web Preview**: Press `w`.

---

## 🏗️ Architecture & Key Modules

- **Navigation**: `@react-navigation/native-stack` & `@react-navigation/bottom-tabs`
- **Audio & Haptics**: `expo-av` and `expo-haptics`
- **Camera & Scanning**: `expo-camera`
- **State & Real-Time**: `AuthContext`, `FeatureContext`, and `EmergencyContext` (`socket.io-client`)
- **Localization**: `react-i18next` with `en.json`, `ml.json`, `hi.json`
