# Marksheet Expo App 📱

A powerful, AI-driven mobile application for creating, distributing, and grading marksheet exams. Built with React Native, Expo, and OpenAI.

## ✨ Features

### Core Features
- **🤖 AI Exam Maker**: Generate exam configurations instantly from PDFs or images using OpenAI Vision.
  - Supports simultaneous "Question" and "Answer Key" upload for auto-correction setup.
  - Handles complex question formats (e.g., "A to Z", "1~26").
  - Supports multiple answer formats: alphabet (A-Z), numbers (1-26), Japanese kana, and iroha.
  - Configurable option count: 2-26 choices per question.
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

- [**Quick Reference**](./docs/quick-reference.md): Fast lookup for common tasks and commands.
- [**Setup Guide**](./docs/setup.md): Installation and API configuration.
- [**Usage Guide**](./docs/usage.md): How to use Maker and Grader tools.
- [**Architecture**](./docs/architecture.md): Tech stack and project structure.
- [**Troubleshooting**](./docs/troubleshooting.md): Common issues and solutions.
- [**Privacy & Security**](./docs/privacy-security.md): Data privacy and security considerations.
- [**Commercial Deployment**](./docs/commercial-deployment.md): Guide for institutional and commercial use.
- [**Feature Roadmap**](./docs/feature-roadmap.md): Current features and future plans.
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
- Maximum 26 options per multiple-choice question.

## 📱 Screenshots

_Coming soon: Screenshots showcasing the Maker, Grader, and Analytics features._

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 💼 Commercial Use

This software is licensed under the MIT License, which permits commercial use. When using this application commercially, please consider:

- **Data Privacy**: All exam data and student information stays on the user's device by default. No data is sent to third parties except OpenAI for AI processing.
- **API Costs**: OpenAI API usage costs are the responsibility of the API key owner. See the Cost Estimation section above.
- **Compliance**: Ensure your use complies with educational data protection regulations (e.g., FERPA, GDPR) in your jurisdiction.
- **No Warranty**: This software is provided "as is" without warranty. See LICENSE for full terms.

For privacy and security documentation, see [docs/privacy-security.md](./docs/privacy-security.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with ❤️ using Expo Router, React Native, and OpenAI.
