# Architecture & Tech Stack 🏗️

## Technology Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **AI / ML**: [OpenAI API](https://platform.openai.com/) (GPT-5-mini-2025-08-07) for layout parsing and grading.
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

**API Integration Flow:**
```
User Upload → File Conversion → OpenAI Vision API → Zod Validation → ExamConfig
```

### `context/exam-context.tsx`

Manages the application state.

- **config**: The current exam being edited in Maker.
- **gradingConfig**: The exam currently selected for grading (independent of Maker).
- **savedExams**: List of locally persisted exams.
- Handles logic for separating "Draft" state from "Saved" state.

**State Management:**
- Uses React Context for global state
- AsyncStorage for persistence
- Automatic synchronization between UI and storage

### `lib/pdf-generator.ts`

PDF generation using `@pdfme/generator`.

- Converts exam configuration to PDF template
- Generates print-ready marksheets
- Handles question layout and formatting

### `lib/exam-utils.ts`

Utility functions for exam operations.

- ID generation for questions
- Option label conversion (A-Z, 1-26, kana, iroha)
- Validation helpers

## Data Flow

### Exam Creation Flow
```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  User Input │────▶│   Validation │────▶│  ExamContext  │
└─────────────┘     └──────────────┘     └───────────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │  AsyncStorage  │
                                         └────────────────┘
```

### AI Generation Flow
```
┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│ PDF/Image│────▶│ OpenAI API │────▶│   Zod    │────▶│  Exam    │
└──────────┘     └────────────┘     │Validation│     │ Config   │
                                     └──────────┘     └──────────┘
```

### Grading Flow
```
┌────────────┐     ┌────────────┐     ┌──────────────┐
│Answer Sheet│────▶│ OpenAI API │────▶│Grade Results │
└────────────┘     └────────────┘     └──────────────┘
       │                                       │
       │                                       ▼
       │                              ┌────────────────┐
       └─────────────────────────────▶│Manual Override │
                                      └────────────────┘
```

## API Documentation

### OpenAI Integration

**Models Used:**
- `gpt-4o`: High accuracy, higher cost (~$0.01-0.05 per operation)
- `gpt-4o-mini`: Lower cost, good accuracy (~$0.001-0.005 per operation)

**Endpoints:**
- Vision API: Image analysis for exam generation and grading
- Structured Output: Ensures valid JSON responses

### Zod Schemas

**ExamConfig Schema:**
```typescript
{
  title: string,
  questions: Question[]
}
```

**Question Schema:**
```typescript
{
  id: string,
  label: string,
  points: number,
  type: 'mark' | 'text',
  optionsCount?: number,
  optionStyle?: 'alphabet' | 'number' | 'kana' | 'iroha',
  correctOptions?: number[],
  boxHeight?: 'small' | 'medium' | 'large'
}
```

**Grading Response Schema:**
```typescript
{
  gradedQuestions: Array<{
    questionId: string,
    selectedOptions: number[] | null
  }>
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components load on-demand
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Async Operations**: Non-blocking UI during API calls
4. **Chunking**: Large exams processed in batches

### Limitations

- **Max Questions**: 100 per exam (recommended for performance)
- **Image Size**: Keep under 20MB for AI processing
- **Network**: Requires active internet for AI features
- **Storage**: Limited by device AsyncStorage capacity

### Scalability

**Current Architecture:**
- Client-side only (no backend required)
- Local storage (no database needed)
- API calls on-demand (no background sync)

**Future Considerations:**
- Backend API for multi-device sync
- Database for analytics and reporting
- Caching for frequently used exams
- Offline mode with queue sync

## Security

### Data Storage

- **API Keys**: Stored in `expo-secure-store` (encrypted)
- **Exam Data**: Stored in AsyncStorage (unencrypted)
- **No Cloud Sync**: All data stays on device

### Best Practices

- Never commit API keys to version control
- Use environment variables for development
- Rotate API keys regularly
- Monitor API usage for anomalies

## Testing Strategy

**Current State**: No automated tests

**Recommended Tests:**
- Unit tests for utility functions (`lib/exam-utils.ts`)
- Integration tests for OpenAI API calls
- Component tests for UI interactions
- E2E tests for critical workflows

**Testing Tools to Consider:**
- Jest for unit tests
- React Native Testing Library for components
- Detox for E2E tests
- Mock Service Worker for API mocking
