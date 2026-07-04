# Cardexa

Cardexa is a local-first, privacy-focused personal finance application built with React Native and Expo. It helps you unify and optimize your credit card spending and subscription management by automatically parsing transaction SMS messages and providing intelligent recommendations.

All user data is stored locally on the device using SQLite, ensuring your financial information remains private and accessible offline. The UI is a sleek, dark-mode interface inspired by Google's Stitch design language.

## Key Features

- **Automatic Subscription Tracking**: Parses transaction SMS messages from your bank to automatically detect and categorize recurring payments and free trials.
- **Smart Card Optimizer**: Recommends the best credit card from your wallet for any given purchase (online or offline) to maximize rewards and cashback.
- **Unified Wallet**: Displays all your credit cards in a visually appealing, interactive stacked deck. Each card has a detailed breakdown of its associated subscriptions and spending.
- **Subscription DNA**: Analyzes your spending habits to create a financial persona (e.g., "The Creator") and provides insights into how your subscriptions compare to your peers.
- **Intelligent Alerts**: Notifies you about upcoming subscription renewals and trial expirations, helping you avoid unwanted charges.
- **Local-First Architecture**: Your data lives on your device. Cardexa functions entirely offline, with no servers or cloud data storage.

## Core Functionality

### SMS Parsing Engine

Cardexa features a robust, RegExp-based SMS parsing engine (`lib/smsParser.ts`) to identify transaction details without relying on any external APIs.

- **Bank-Specific Parsers**: Includes dedicated parsers for major Indian banks like HDFC, ICICI, SBI, and Axis Bank.
- **Heuristic Fallbacks**: A generic parser attempts to extract information from SMS messages from unsupported banks.
- **Noise Filtering**: Automatically rejects non-transactional messages like OTPs, offers, and balance alerts.
- **Data Normalization**: Cleans and standardizes merchant names, amounts, and dates for consistent tracking.

### Card Optimizer

The Card Optimizer (`lib/cardOptimizer.ts`) is a heuristic engine that calculates the best card for a given transaction.

- **Bank & Network Profiles**: The engine models reward profiles for different banks (base reward, category bonuses, annual fees) and combines them with network-specific traits (e.g., RuPay's fuel bonuses, Visa's global acceptance).
- **Dynamic Calculation**: It calculates an `effectiveReward` percentage based on the merchant, amount, and payment frequency (one-time, monthly, etc.).
- **Scoring & Reasoning**: Each recommendation is given a score and a list of human-readable reasons, explaining *why* a particular card is the best choice. This includes factors like category bonuses, high-value transaction boosts, and annual fee efficiency.
- **Recurring Payments**: For recurring transactions, the optimizer projects annual savings and calculates the net annual value after accounting for card fees.

## Tech Stack

- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **Database**: `expo-sqlite` with direct SQL queries (local-first)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animation**: React Native Reanimated, Lottie
- **Icons**: Lucide React Native
- **Charts**: `react-native-gifted-charts`

## Project Structure

The codebase is organized to separate UI, business logic, and data layers, promoting maintainability and testability.

```
.
├── app/                  # Expo Router file-based routes
│   ├── (tabs)/           # Main app tabs (Dashboard, Wallet, etc.)
│   ├── auth/             # Login and registration screens
│   └── ...               # Modal and detail screens
├── components/           # Reusable React components
│   ├── cards/            # Card-related components (CreditCard, StackedCardDeck)
│   ├── sms/              # SMS detection bottom sheet flow
│   └── ui/               # Generic UI elements (BottomSheet, TabBar, Toast)
├── constants/            # App-wide constants (theme, categories, gradients)
├── db/                   # Database client, schema, and seed data
├── lib/                  # Core business logic (pure TypeScript)
│   ├── cardOptimizer.ts  # Heuristic engine for card recommendations
│   ├── smsParser.ts      # RegExp-based SMS parsing logic
│   ├── smsSync.ts        # Platform-aware SMS inbox synchronization
│   └── categorizer.ts    # Merchant-to-category mapping
└── store/                # Zustand stores for global state management
```

## Getting Started

### Prerequisites

- Node.js (LTS version)
- `npm` or `yarn`
- Expo Go app on your mobile device or an Android/iOS simulator.

### Installation & Running

1.  **Clone the repository:**

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```

4.  Scan the QR code with the Expo Go app on your phone to launch the project. On an emulator, the app may open automatically.

Since the application is local-first, it will initialize and seed an SQLite database on its first run.