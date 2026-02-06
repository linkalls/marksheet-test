# Usage Guide 📖

## 📝 Exam Maker (Home Tab)

The **Maker** tab is where you design your marksheet layout.

### Creating an Exam

1. **Manual Creation**:
   - Tap **"Add Mark"** to add multiple-choice questions (e.g., A-D, 1-4).
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

## 📊 Grader (Explore Tab)

The **Grader** tab allows you to score filled answer sheets using AI Vision.

### Grading Process

1. **Select Exam**:
   - Tap the **"Current Exam"** card at the top.
   - Choose a saved exam from the list, or use the "Current Maker Draft".
2. **Scan/Selected Answer Sheet**:
   - Tap **"Select answer sheet"** to upload a photo of a student's filled marksheet.
3. **Run Grading**:
   - Tap **"👁️ Grade with AI Vision"**.
   - The AI will compare the student's marks against your configured "Correct Answers".
4. **Review Results**:
   - The score is displayed at the top.
   - Review individual questions.
   - **Manual Correction**: Tap any result row to manually override the detected answer if the AI made a mistake.

## ⚙️ Settings

- **API Key**: Manage your OpenAI key safely.
- **Model**: Switch models (e.g., `gpt-5-mini-2025-08-07`, `gpt-4o`).
- **Debug Mode**: Enable verify detailed logs for troubleshooting.
