# Setup Guide 🛠️

## Prerequisites

- **Node.js** (LTS) or **Bun** (Recommended)
- **Expo Go** app on your mobile device (iOS/Android) OR Android Studio/Xcode (Simulator)
- **OpenAI API Key**: Required for AI generation and grading.

## Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd marksheet-test
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

## Configuration

### 1. OpenAI API Key (Recommended)

You can configure the API Key directly inside the app:

1. Open the app.
2. Go to the **Settings** tab (Gear icon).
3. Enter your API Key in the "OpenAI API Key" field.
4. (Optional) Set a Model Name (default config uses `gpt-4o-mini` or similar if not specified, but `gpt-4o` is recommended for high accuracy).
5. Tap **Save Settings**.

The key is stored securely on your device using `expo-secure-store`.

### 2. Environment Variables (Fallback)

You can also create a `.env` file for development (though the in-app setting takes precedence):

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

## Running the App

Start the Metro bundler:

```bash
bun start
```

- **Scan QR Code**: Use the Expo Go app on your phone to scan the QR code.
- **Simulator**: Press `a` for Android or `i` for iOS simulator.

## Debugging

If you encounter issues with AI generation:

1. Go to **Settings**.
2. Enable **Debug Mode**.
3. Check your terminal/console for detailed logs (`[DEBUG] ...`).
