# Marksheet Expo App 📱

A powerful, AI-driven mobile application for creating, distributing, and grading marksheet exams. Built with React Native, Expo, and OpenAI.

## ✨ Features

### Core Features
- **🤖 AI Exam Maker**: Generate exam configurations instantly from PDFs or images using OpenAI Vision.
  - Supports simultaneous "Question" and "Answer Key" upload for auto-correction setup.
  - Handles complex question formats (e.g., "A to D", "1~5").
  - Supports multiple answer formats: alphabet (A-D), numbers (1-4), Japanese kana, and iroha.
- **📄 PDF Export**: Generate printable marksheet PDFs directly from the app.
- **📷 AI Vision Grader**: Scan filled answer sheets with your camera or imports to grade them instantly.
  - Automatic grading with AI vision technology.
  - Manual correction support for edge cases.
  - Multiple answer support for select-all-that-apply questions.
- **📊 Exam Analytics**: View detailed statistics including score distribution and question difficulty analysis.
- **📦 Batch Operations**: Duplicate exams, export results to CSV, and manage multiple exams efficiently.
- **⚙️ Customizable Settings**: Manage your OpenAI API Key, Model (e.g., `gpt-5-mini-2025-08-07`), and Debug Mode securely.
- **💾 Local Persistence**: Auto-save your exam drafts and grading history.
- **🔍 Search & Filter**: Quickly find saved exams with built-in search functionality.

## 🚀 Quick Start

1. **Install Dependencies**:

   ```bash
   bun install
   ```

2. **Configure Settings**:
   - The app uses OpenAI for vision tasks.
   - You can set your API Key in the **Settings** tab within the app, or use an environment variable `.env` file (see `docs/setup.md`).

3. **Run the App**:
   ```bash
   bun start
   ```

## 📚 Documentation

- [**Setup Guide**](./docs/setup.md): Installation and API configuration.
- [**Usage Guide**](./docs/usage.md): How to use Maker and Grader tools.
- [**Architecture**](./docs/architecture.md): Tech stack and project structure.
- [**Troubleshooting**](./docs/troubleshooting.md): Common issues and solutions.
- [**Contributing**](./CONTRIBUTING.md): Guidelines for contributing to the project.

## 💰 Cost Estimation

This app uses OpenAI's API for AI-powered features. Here's an estimate of typical costs:

- **GPT-4o Vision** (recommended): ~$0.01-0.05 per exam generation or grading operation
- **GPT-4o-mini**: ~$0.001-0.005 per operation (more economical, slightly less accurate)

For a class of 30 students with 1 exam per week:
- Exam generation: ~$0.05/week
- Grading 30 sheets: ~$0.30-1.50/week
- **Total**: ~$15-70/year depending on usage and model choice

See [OpenAI Pricing](https://openai.com/pricing) for current rates.

## 🎯 Use Cases

- **Teachers**: Create and grade multiple-choice and short-answer exams efficiently.
- **Tutors**: Quick assessment creation and instant feedback for students.
- **Educational Institutions**: Standardized testing with automated grading.
- **Online Courses**: Remote exam administration with AI-powered evaluation.

## ⚠️ Limitations

- Requires active internet connection for AI features.
- OpenAI API key required (not included).
- Best results with clear, high-contrast scanned answer sheets.
- Maximum recommended: 100 questions per exam for optimal performance.
- Currently supports single-page exams only.

## 📱 Screenshots

_Coming soon: Screenshots showcasing the Maker, Grader, and Analytics features._

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using Expo Router, React Native, and OpenAI.
