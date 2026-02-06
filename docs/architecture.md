# Architecture & Tech Stack 🏗️

## Technology Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **AI / ML**: [OpenAI API](https://platform.openai.com/) (GPT-5-mini ) for layout parsing and grading.
- **Storage**:
  - `expo-secure-store`: Encrypted storage for API Keys.
  - `@react-native-async-storage`: JSON storage for exam drafts and settings.
- **PDF Generation**: `@pdfme/generator` for creating print-ready marksheets.
- **UI**: Custom components with `StyleSheet`, utilizing `expo-linear-gradient` and `expo-haptics` for a premium feel.

## Directory Structure

```
marksheet-test/
├── app/                 # Expo Router screens
│   ├── (tabs)/          # Main tab navigation
│   │   ├── index.tsx    # "Maker" screen
│   │   ├── explore.tsx  # "Grader" screen
│   │   └── settings.tsx # Settings screen
│   └── _layout.tsx      # Root layout & Providers
├── components/          # Reusable UI components
├── constants/           # Theme, Styles, Keys
├── context/             # React Context Providers
│   ├── exam-context.tsx     # Exam state & persistence
│   └── settings-context.tsx # App configuration state
├── docs/                # Documentation
├── lib/                 # Core Logic & Utilities
│   ├── openai.ts        # OpenAI API integration (Zod schemas, prompts)
│   ├── pdf-generator.ts # PDF generation logic
│   └── exam-utils.ts    # UI helpers & ID generation
└── assets/              # Static images/fonts
```

## Key Modules

### `lib/openai.ts`

Handles all interactions with OpenAI.

- Uses **Structured Outputs** (Zod Schema) to guarantee valid JSON responses.
- `getAppConfig()`: Dynamically retrieves API credentials from SecureStore or Env.
- `generateExamConfigFrom...`: Parses PDFs/Images into `ExamConfig`.
- `gradeByVisionFromFile`: Analyzes answer sheet images against the exam schema.

### `context/exam-context.tsx`

Manages the application state.

- **config**: The current exam being edited in Maker.
- **gradingConfig**: The exam currently selected for grading (independent of Maker).
- **savedExams**: List of locally persisted exams.
- Handles logic for separating "Draft" state from "Saved" state.
