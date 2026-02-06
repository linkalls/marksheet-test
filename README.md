# Marksheet Expo App 📱

A powerful, AI-driven mobile application for creating, distributing, and grading marksheet exams. Built with React Native, Expo, and OpenAI.

## ✨ Features

- **🤖 AI Exam Maker**: Generate exam configurations instantly from PDFs or images using OpenAI Vision.
  - Supports simultaneous "Question" and "Answer Key" upload for auto-correction setup.
  - Handles complex question formats (e.g., "A to D", "1~5").
- **📄 PDF Export**: Generate printable marksheet PDFs directly from the app.
- **📷 AI Vision Grader**: Scan filled answer sheets with your camera or imports to grade them instantly.
- **⚙️ Customizable Settings**: Manage your OpenAI API Key, Model (e.g., `gpt-5-mini-2025-08-07`), and Debug Mode securely.
- **💾 Local Persistence**: Auto-save your exam drafts and grading history.

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

---

Built with Expo Router, NativeWind (concepts), and OpenAI.
