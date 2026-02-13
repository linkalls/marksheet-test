# Quick Reference Guide 📋

Quick reference for common tasks in the Marksheet Expo App.

## 🚀 Getting Started

```bash
# Install dependencies
npm install  # or bun install

# Start the app
npm start    # or bun start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## 🔑 Configuration

### API Key Setup
1. Open app → Settings tab
2. Enter OpenAI API Key
3. (Optional) Change model (default: `gpt-4o`)
4. Tap "Save Settings"

### Environment Variables
```bash
# Create .env file
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

## 📝 Creating Exams

### Manual Creation
```
1. Tap "Maker" tab
2. Tap "Add Mark" (multiple choice) or "Add Text" (written)
3. Configure question settings:
   - Label (e.g., Q1, Q2)
   - Points value
   - Option count (2-10 choices)
   - Option style (A-J, 1-10, kana, iroha)
   - Correct answer(s)
4. Tap "Save"
```

**Option Styles Example:**
- **Alphabet**: a, b, c, d, e, f (up to j for 10 options)
- **Number**: 1, 2, 3, 4, 5, 6 (up to 10)
- **Kana**: あ, い, う, え, お, か (up to 10 characters)
- **Iroha**: イ, ロ, ハ, ニ, ホ, ヘ (up to 10 characters)

### AI Generation
```
1. Tap "Select source file"
2. Upload question PDF/image
3. (Optional) Upload answer key
4. Tap "✨ Generate Exam Config"
5. Review and adjust
6. Tap "Save"
```

## 📊 Grading

### Basic Grading
```
1. Tap "Grader" tab
2. Tap "Current Exam" → Select exam
3. Tap "Select answer sheet" → Upload image
4. Tap "👁️ Grade with AI Vision"
5. Review results
```

### Manual Correction
```
1. After grading, tap any question row
2. Select correct answer
3. Score updates automatically
```

## 💾 Managing Exams

| Action | How To |
|--------|--------|
| **Search** | Use search bar in "My Exams" |
| **Load** | Tap exam card |
| **Duplicate** | Tap 📋 icon on exam card |
| **Delete** | Tap 🗑️ icon or long-press card |
| **Export PDF** | Tap "Export PDF" in Maker |
| **Export CSV** | Use export button after grading |

## 📈 Analytics

View exam statistics:
- Score distribution
- Average/median scores
- Question difficulty
- Student performance trends

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate fields |
| `Enter` | Confirm/Submit |
| `Esc` | Close modals |
| `Ctrl/Cmd + S` | Quick save (Maker) |

## 🔧 Troubleshooting

### Common Issues

**API Key Error**
```
Settings → Enter valid API key (starts with sk-)
```

**Generation Failed**
```
- Check image quality (300+ DPI)
- Ensure clear formatting
- Enable Debug Mode for logs
```

**Grading Inaccurate**
```
- Use dark marks (pen/dark pencil)
- Avoid erasures/stray marks
- Manual correction available
```

**Storage Full**
```
Settings → Clear old exams
Delete unused grading history
```

## 📦 Export Formats

### CSV Export
- Grading results → CSV
- Exam config → CSV
- Compatible with Excel/Sheets

### PDF Export
- Printable marksheets
- Share with students
- Print for distribution

## 🎯 Best Practices

### For Best AI Accuracy
- Use high-resolution scans (300+ DPI)
- Consistent question numbering
- Clear answer option labels
- Proper lighting, no shadows

### For Performance
- Keep exams under 100 questions
- Clear old grading history regularly
- Use appropriate image sizes (<20MB)

### For Security
- Never commit API keys to git
- Rotate keys regularly
- Use environment variables in CI/CD

## 🔄 Workflow Examples

### Weekly Quiz Workflow
```
1. Create template exam once
2. Duplicate for each week
3. Modify specific questions
4. Export PDF for students
5. Grade all submissions
6. Export results to CSV
7. Review analytics
```

### Standardized Testing
```
1. AI-generate from official exam
2. Review/adjust correct answers
3. Print marksheets for class
4. Batch grade after collection
5. Generate performance reports
6. Identify struggling students
```

## 🆘 Getting Help

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Enable Debug Mode for logs
3. Search [GitHub Issues](https://github.com/linkalls/marksheet-test/issues)
4. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Debug logs
   - Screenshots

## 📚 Additional Resources

- [Setup Guide](./setup.md) - Detailed installation
- [Usage Guide](./usage.md) - Feature walkthroughs
- [Architecture](./architecture.md) - Technical details
- [Contributing](../CONTRIBUTING.md) - Development guide

---

**Pro Tip**: Enable Debug Mode during your first few uses to understand how the app works!
