# Contributing to Marksheet Expo App 🤝

Thank you for your interest in contributing to the Marksheet Expo App! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Expo version, device)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been suggested
2. Create an issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain how it would benefit users

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit** with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: brief description"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/videos for UI changes

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define types for all function parameters and return values
- Avoid `any` types - use proper type definitions

### Code Style

- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small (< 50 lines when possible)

### React Native / Expo

- Use functional components with hooks
- Follow React Native best practices
- Use the existing theme constants from `constants/theme.ts`
- Implement proper error handling

### File Organization

```
app/          # Expo Router screens
components/   # Reusable UI components
lib/          # Business logic and utilities
context/      # React Context providers
types/        # TypeScript type definitions
constants/    # App-wide constants
docs/         # Documentation
```

## 🧪 Testing

Currently, this project does not have automated tests. When adding new features:

1. **Manual testing** is required
2. Test on both iOS and Android if possible
3. Test with different screen sizes
4. Verify API error handling

Future contributions of testing infrastructure are welcome!

## 🔧 Development Setup

1. **Install dependencies**:
   ```bash
   bun install
   # or npm install
   ```

2. **Configure environment**:
   - Set up OpenAI API key in Settings tab or `.env` file
   - See `docs/setup.md` for details

3. **Run the app**:
   ```bash
   bun start
   ```

4. **Linting**:
   ```bash
   bun run lint
   ```

## 📦 Dependencies

When adding new dependencies:

1. Ensure they are necessary and well-maintained
2. Check bundle size impact
3. Verify Expo compatibility
4. Update `package.json` with appropriate version ranges

## 🎨 UI/UX Guidelines

- Maintain consistency with existing design
- Use haptic feedback for user interactions
- Show loading states for async operations
- Display clear error messages
- Ensure accessibility (contrast ratios, touch targets)

## 📱 Platform Considerations

- Test on both iOS and Android
- Consider web compatibility where applicable
- Handle platform-specific APIs appropriately
- Use Expo's cross-platform APIs when available

## 🐛 Debugging

Enable Debug Mode in Settings to see detailed logs:

```typescript
console.log('[DEBUG] Your debug message');
```

Check the terminal/console for output when debugging.

## 💡 Feature Ideas

Looking for something to work on? Check out:

- Open issues labeled `good first issue`
- Feature requests in discussions
- Items in the project roadmap

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Questions?

Feel free to:

- Open a discussion on GitHub
- Comment on related issues
- Reach out to maintainers

Thank you for making the Marksheet Expo App better! 🎉
