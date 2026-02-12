# Troubleshooting Guide 🔧

Common issues and solutions for the Marksheet Expo App.

## 🚨 Common Issues

### API Configuration Issues

#### ❌ "API Key not configured" Error

**Problem**: The app cannot find your OpenAI API key.

**Solutions**:
1. **In-App Configuration** (Recommended):
   - Open the app
   - Navigate to Settings tab (gear icon)
   - Enter your API key in the "OpenAI API Key" field
   - Tap "Save Settings"

2. **Environment Variable**:
   - Create a `.env` file in the project root
   - Add: `EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...`
   - Restart the Metro bundler

3. **Verify Key Format**:
   - Ensure the key starts with `sk-proj-` or `sk-`
   - No extra spaces or quotes
   - Key is valid and not revoked

#### ❌ "Invalid API Key" or 401 Errors

**Problem**: The API key is rejected by OpenAI.

**Solutions**:
- Verify the key is active on [OpenAI Platform](https://platform.openai.com/api-keys)
- Check if you have billing enabled
- Ensure you have sufficient credits
- Try regenerating the API key

---

### AI Generation Issues

#### ❌ Exam Generation Fails

**Problem**: AI cannot parse the uploaded PDF/image.

**Solutions**:
1. **Image Quality**:
   - Use high-resolution images (300+ DPI)
   - Ensure good lighting and contrast
   - Avoid blurry or skewed images

2. **File Format**:
   - Supported: PDF, PNG, JPG, JPEG
   - Keep file size under 20MB
   - Single-page documents work best

3. **Question Layout**:
   - Clearly formatted questions
   - Consistent numbering (1, 2, 3... or Q1, Q2, Q3...)
   - Distinct answer options

4. **Debug Mode**:
   - Enable Debug Mode in Settings
   - Check console for detailed error messages
   - Review the exact error from OpenAI API

#### ❌ Incorrect Questions Generated

**Problem**: AI generates wrong questions or answer options.

**Solutions**:
- Manually edit questions after generation
- Upload a clearer source document
- Use the answer key upload feature for auto-correction
- Try a different AI model (GPT-4o for better accuracy)

---

### Grading Issues

#### ❌ Grading Accuracy Problems

**Problem**: AI misreads student answers.

**Solutions**:
1. **Answer Sheet Quality**:
   - Clear, dark marks (pen or dark pencil)
   - No stray marks or erasures
   - Proper alignment (not skewed)

2. **Manual Correction**:
   - Tap any grading result to manually override
   - Adjust answers as needed
   - Save corrected results

3. **Multiple Answers**:
   - For "select all that apply" questions, ensure `correctOptions` is an array
   - Verify question configuration supports multiple answers

#### ❌ "No exam selected for grading"

**Problem**: Grader tab shows no exam loaded.

**Solutions**:
- Tap "Current Exam" card at the top
- Select an exam from the list
- Ensure you have saved at least one exam
- Check that the exam has questions with correct answers defined

---

### PDF Export Issues

#### ❌ PDF Generation Fails

**Problem**: Cannot export exam as PDF.

**Solutions**:
1. **Verify Exam Data**:
   - Ensure exam has at least one question
   - Check that all questions have valid configurations

2. **Permissions**:
   - Grant file system permissions when prompted
   - Check device storage space

3. **Try Again**:
   - Close and reopen the app
   - Save the exam first, then export

---

### Performance Issues

#### ❌ App Slow or Laggy

**Problem**: App performance degrades with large exams.

**Solutions**:
1. **Optimize Exam Size**:
   - Keep exams under 100 questions
   - Split large exams into multiple parts

2. **Clear Cache**:
   - Close and reopen the app
   - Clear saved exams you no longer need

3. **Device Performance**:
   - Close other apps
   - Restart your device
   - Ensure sufficient storage space

---

### Installation Issues

#### ❌ Dependencies Won't Install

**Problem**: `bun install` or `npm install` fails.

**Solutions**:
```bash
# Clear cache and retry
rm -rf node_modules
rm bun.lock  # or package-lock.json / yarn.lock
bun install  # or npm install
```

#### ❌ Expo Won't Start

**Problem**: `bun start` fails.

**Solutions**:
```bash
# Reset Expo cache
expo start -c

# Or reset project
bun run reset-project
```

---

### Network Issues

#### ❌ "Network request failed"

**Problem**: Cannot connect to OpenAI API.

**Solutions**:
1. **Internet Connection**:
   - Verify you have internet access
   - Try a different network

2. **Firewall/Proxy**:
   - Check if your firewall blocks OpenAI API
   - Configure proxy settings if needed:
     ```bash
     export HTTP_PROXY=http://proxy:port
     export HTTPS_PROXY=http://proxy:port
     ```

3. **VPN Issues**:
   - Try disabling VPN
   - Some VPNs block OpenAI API

---

## 🔍 Debug Mode

Enable Debug Mode for detailed logs:

1. Open **Settings** tab
2. Toggle **Debug Mode** to ON
3. Check terminal/console for detailed logs prefixed with `[DEBUG]`

Example debug output:
```
[DEBUG] Config loaded. Model: gpt-4o, Key exists: true
[DEBUG] Generating exam from files...
[DEBUG] Response: { questions: [...] }
```

---

## 📱 Platform-Specific Issues

### iOS

- **Permissions**: Grant camera/photo library access when prompted
- **Simulator**: Some features may not work in simulator (camera, haptics)

### Android

- **Permissions**: Grant storage and camera permissions in app settings
- **Back Button**: May exit app - use in-app navigation

### Web

- **Limited Support**: Some native features unavailable (camera, haptics, secure storage)
- **Use Mobile**: For best experience, use iOS or Android

---

## 💬 Getting Help

If your issue isn't listed here:

1. **Search Issues**: Check [GitHub Issues](https://github.com/linkalls/marksheet-test/issues)
2. **Create Issue**: Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Screenshots/error messages
   - Environment details (OS, device, Expo version)
3. **Debug Logs**: Include console output with Debug Mode enabled

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Setup Guide](./setup.md)
- [Usage Guide](./usage.md)

---

**Still stuck?** Don't hesitate to ask for help in GitHub Discussions or Issues!
