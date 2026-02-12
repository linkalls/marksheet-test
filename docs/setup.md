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
4. (Optional) Set a Model Name (default config uses `gpt-4o` or similar if not specified).
5. Tap **Save Settings**.

The key is stored securely on your device using `expo-secure-store`.

### 2. Environment Variables (Fallback)

You can also create a `.env` file for development (though the in-app setting takes precedence):

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

**Environment Variables Reference:**
- `EXPO_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key
- Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app

**For CI/CD pipelines**, set these as environment variables in your build system.

### 3. Firewall/Proxy Configuration

If you're behind a corporate firewall or proxy:

```bash
# Set proxy environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Or configure in your system settings
```

Some networks may block OpenAI API domains. Contact your IT department if you experience connection issues.

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

### Common Debug Commands

```bash
# Clear Expo cache
expo start -c

# Reset project to defaults
bun run reset-project

# View detailed Metro logs
bun start --verbose
```

### Troubleshooting

For common issues and solutions, see the [Troubleshooting Guide](./troubleshooting.md).

## Performance Tips

- Keep exams under 100 questions for optimal performance
- Use high-quality, clear images for AI generation
- Close unused apps when grading large batches
- Regularly clear saved exams you no longer need
