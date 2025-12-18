# FairTradeWorker iOS App

This is the iOS app version of FairTradeWorker, built with Expo and React Native.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS simulator)
- EAS CLI: `npm install -g eas-cli` (for building)

### Installation

1. Navigate to the ios-app directory:
   ```bash
   cd ios-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on iOS simulator:
   ```bash
   npm run ios
   ```

## 📱 Features

This iOS app includes all core features from the web application:

### For Homeowners
- 📝 Post jobs with AI-powered scoping
- 🎯 Choose from 7 major project templates (Kitchen, Bathroom, Roof, Deck, Fence, Room Addition, Custom)
- 📊 Select job tier (Small/Medium/Large) for better matching
- 📷 Upload photos of your project
- 💰 Get instant price estimates based on project type
- 🔔 Receive bids from contractors
- ✅ Accept bids and track progress

### For Contractors/Subcontractors
- 🔍 Browse available jobs with Netflix-style horizontal carousel
- 💵 Submit bids (no fees!)
- 📊 View jobs by category (Fresh, Quick, Standard, Major)
- 🏆 Build your reputation
- 💼 Manage your business
- 🎨 100% of earnings kept

### For Operators
- 🗺️ Claim territories
- 📈 View analytics
- 🎯 Track key metrics

### Latest Updates (December 2025)
- ✅ **Project Templates**: 7 major project types with price ranges
- ✅ **Multi-Step Job Posting**: Tier selection → Project type → Details
- ✅ **2-Column Grid Layout**: Mobile-optimized project selection
- ✅ **Enhanced AI Scoping**: Better estimates based on project type
- ✅ **Shadow-Based Design**: Consistent with web app (no borders, depth through shadows)
- ✅ **Netflix-Style Browse**: Horizontal scrolling job lanes

## 🏗️ Project Structure

```
ios-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── browse.tsx     # Browse jobs (Netflix-style)
│   │   ├── dashboard.tsx  # User dashboard
│   │   └── profile.tsx    # Profile/settings
│   ├── job/
│   │   └── [id].tsx       # Job details
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Signup screen
│   ├── post-job.tsx       # Post job screen (multi-step with templates)
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components (shadow-based design)
│   │   └── jobs/         # Job-related components
│   ├── constants/        # Theme & demo data
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript types
│   └── hooks/            # Custom hooks
├── assets/               # Images & icons
├── app.json              # Expo config
├── eas.json              # EAS Build config
└── package.json
```

## 🎨 Design System

The app follows the same design system as the web app (updated December 2025):

### Visual Philosophy
- **Depth**: Shadow-based (NO borders) - cards and buttons use layered shadows
- **Cards**: Rounded corners (`borderRadius: 16`), elevated appearance
- **Buttons**: 3D effects with layered shadows, touch feedback
- **Colors**: Clean palette with construction orange primary

### Colors
- **Primary Color**: Construction Orange (#F97316)
- **Secondary Color**: Trust Blue (#3B82F6)
- **Accent Color**: Bright Yellow-Orange (#FBBF24)

### Shadow System
- Small shadows: 0-2px offset, 5% opacity
- Medium shadows: 0-4px offset, 10% opacity
- Large shadows: 0-8px offset, 15% opacity
- 3D Button shadows: 0-6px offset, 30% opacity with hover lift

## 🔧 Build for Production

### Using EAS Build

1. Configure your EAS project:
   ```bash
   eas build:configure
   ```

2. Build for iOS:
   ```bash
   eas build --platform ios
   ```

3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Local Build (requires Xcode)

```bash
npx expo run:ios --configuration Release
```

## 📝 Environment Variables

Create a `.env` file for environment-specific configuration:

```env
EXPO_PUBLIC_API_URL=https://api.fairtradeworker.com
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ using Expo and React Native
