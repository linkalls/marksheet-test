export type QuestionType = 'mark' | 'text';
export type OptionStyle = 'number' | 'alphabet' | 'kana' | 'iroha';
export type TextBoxHeight = 'small' | 'medium' | 'large';

export interface Question {
  id: string;
  label: string;
  points: number;
  type: QuestionType;
  optionsCount?: number;
  optionStyle?: OptionStyle;
  correctOption?: number | null;
  boxHeight?: TextBoxHeight;
}

export interface ExamConfig {
  title: string;
  questions: Question[];
}

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  title: 'Sample Exam',
  questions: [
    {
      id: 'q1',
      label: 'Q1',
      points: 5,
      type: 'mark',
      optionsCount: 4,
      optionStyle: 'alphabet',
      correctOption: 0,
    },
    {
      id: 'q2',
      label: 'Q2',
      points: 5,
      type: 'mark',
      optionsCount: 4,
      optionStyle: 'alphabet',
      correctOption: 2,
    },
    {
      id: 'q3',
      label: 'Q3',
      points: 10,
      type: 'text',
      boxHeight: 'medium',
    },
  ],
};
