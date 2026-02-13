# Usage Guide 📖

## 📝 Exam Maker (Home Tab)

The **Maker** tab is where you design your marksheet layout and manage saved exams.

### Creating an Exam

1. **Manual Creation**:
   - Tap **"Add Mark"** to add multiple-choice questions (e.g., A-Z, 1-26, up to 26 options).
   - Tap **"Add Text"** to add written answer boxes.
   - Edit labels, points, and correct options directly on the card.

2. **AI Generation (Recommended)**:
   - Tap **"Select source file"** provided by the AI Generation card. Upload a **Question PDF/Image**.
   - (Optional) **"Select answer key"**: Upload a solution image to automatically set correct answers.
   - Tap **"✨ Generate Exam Config"**.
   - The AI will analyze the layout and build your questions automatically.

3. **Saving & Exporting**:
   - **Save**: Saves the current draft to local storage.
   - **Export PDF**: Generates a printable marksheet PDF to share with students.
   - **New Exam**: Tap the `+ New` button in the header to clear the current draft.

### Managing Saved Exams

In the **My Exams** screen:
- **Search**: Use the search bar to filter exams by title
- **Load**: Tap an exam to load it into the editor
- **Duplicate**: Tap the 📋 icon to create a copy of an exam
- **Delete**: Tap the 🗑️ icon or long-press an exam card to delete it
- **Export**: Export exam configuration to CSV for backup or sharing

## 📊 Grader (Explore Tab)

The **Grader** tab allows you to score filled answer sheets using AI Vision and track analytics.

### Grading Process

1. **Select Exam**:
   - Tap the **"Current Exam"** card at the top.
   - Choose a saved exam from the list, or use the "Current Maker Draft".
2. **Scan/Select Answer Sheet**:
   - Tap **"Select answer sheet"** to upload a photo of a student's filled marksheet.
3. **Run Grading**:
   - Tap **"👁️ Grade with AI Vision"**.
   - The AI will compare the student's marks against your configured "Correct Answers".
4. **Review Results**:
   - The score is displayed at the top.
   - Review individual questions.
   - **Manual Correction**: Tap any result row to manually override the detected answer if the AI made a mistake.
5. **Save Results** (Optional):
   - Grading results are automatically saved to history.
   - View analytics and statistics for all graded exams.

### Analytics Features

After grading one or more answer sheets:
- View **score distribution** across all students
- See **average, highest, and lowest scores**
- Identify **difficult questions** based on student performance
- Track **grading history** over time

### Exporting Results

Export grading data for external analysis:
1. Navigate to the graded exam
2. Tap the **Export** button
3. Choose **CSV format** for spreadsheet compatibility
4. Share via email, cloud storage, or other apps

## ⚙️ Settings

- **API Key**: Manage your OpenAI key safely.
- **Model**: Switch models (e.g., `gpt-4o`, `gpt-4o-mini`).
- **Debug Mode**: Enable to view detailed logs for troubleshooting.

## 🎯 Advanced Workflows

### Template Creation

1. Create a base exam with common questions
2. Save it with a descriptive name (e.g., "Weekly Quiz Template")
3. Load it when creating new exams
4. Modify specific questions as needed

### Batch Grading Tips

For grading multiple students efficiently:

1. Prepare all answer sheets (scan/photo in advance)
2. Select exam once in Grader tab
3. Grade sheets one by one
4. Use manual correction sparingly for speed

### Question Duplication

To reuse similar questions:

1. Copy question text manually
2. Add as new question in Maker
3. Adjust differences (points, options, correct answers)

## ⌨️ Keyboard Shortcuts

When using web version or with external keyboard:

- **Tab**: Navigate between input fields
- **Enter**: Confirm/submit actions
- **Esc**: Close modals/dialogs
- **Ctrl/Cmd + S**: Quick save (in Maker tab)

## 💡 Performance Tips

- **Large Exams**: Keep under 100 questions for optimal performance
- **Image Quality**: Use 300+ DPI scans for best AI accuracy
- **Batch Operations**: Grade multiple students back-to-back in one session
- **Storage**: Delete old exams you no longer need

## 🎬 Video Tutorials

_Coming soon: Step-by-step video guides for common workflows_

## 📊 Understanding Results

### Score Calculation

- Each question shows points earned vs. total points
- Total score is the sum of all correct answers
- Percentage is calculated automatically

### Manual Corrections

If AI misreads an answer:

1. Tap the result row
2. Select the correct answer
3. The score updates automatically
4. Corrections are saved with the exam

## 🔍 Tips for Better Accuracy

### For Exam Generation:

- Use clear, high-contrast source documents
- Ensure consistent question numbering
- Label answer options clearly (A, B, C, D or 1, 2, 3, 4)
- Upload answer key image for auto-correction

### For Grading:

- Use dark pens or pencils for filling answers
- Avoid stray marks or erasures
- Keep answer sheets flat and well-lit
- Ensure proper alignment when capturing images

## 🚀 Quick Start Checklist

**First Time Setup:**
- [ ] Install dependencies (`bun install`)
- [ ] Configure OpenAI API key in Settings
- [ ] Test with sample exam creation
- [ ] Try AI generation with a sample PDF
- [ ] Practice grading with a test answer sheet

**Creating Your First Exam:**
- [ ] Navigate to Maker tab
- [ ] Add questions (manual or AI-generated)
- [ ] Set correct answers
- [ ] Save the exam
- [ ] Export PDF for distribution

**Grading Process:**
- [ ] Collect filled answer sheets
- [ ] Select exam in Grader tab
- [ ] Upload answer sheet images
- [ ] Run AI grading
- [ ] Review and correct if needed
- [ ] Record final scores
