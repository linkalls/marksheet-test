import type { ExamConfig, Question } from '@/types/exam';

/**
 * Validation errors for exam configuration
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate exam configuration before saving or exporting
 */
export function validateExamConfig(config: ExamConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!config.title || config.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Exam title is required',
    });
  } else if (config.title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Exam title must be less than 100 characters',
    });
  }

  // Questions validation
  if (!config.questions || config.questions.length === 0) {
    errors.push({
      field: 'questions',
      message: 'At least one question is required',
    });
  } else if (config.questions.length > 100) {
    errors.push({
      field: 'questions',
      message: 'Maximum 100 questions allowed for optimal performance',
    });
  }

  // Individual question validation
  config.questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question, index);
    errors.push(...questionErrors);
  });

  return errors;
}

/**
 * Validate individual question
 */
export function validateQuestion(question: Question, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `questions[${index}]`;

  // ID validation
  if (!question.id || question.id.trim().length === 0) {
    errors.push({
      field: `${prefix}.id`,
      message: `Question ${index + 1}: ID is required`,
    });
  }

  // Label validation
  if (!question.label || question.label.trim().length === 0) {
    errors.push({
      field: `${prefix}.label`,
      message: `Question ${index + 1}: Label is required`,
    });
  } else if (question.label.length > 50) {
    errors.push({
      field: `${prefix}.label`,
      message: `Question ${index + 1}: Label must be less than 50 characters`,
    });
  }

  // Points validation
  if (question.points === undefined || question.points === null) {
    errors.push({
      field: `${prefix}.points`,
      message: `Question ${index + 1}: Points value is required`,
    });
  } else if (question.points < 0) {
    errors.push({
      field: `${prefix}.points`,
      message: `Question ${index + 1}: Points cannot be negative`,
    });
  } else if (question.points > 1000) {
    errors.push({
      field: `${prefix}.points`,
      message: `Question ${index + 1}: Points value is too high (max 1000)`,
    });
  }

  // Type-specific validation
  if (question.type === 'mark') {
    // Mark type validation
    if (!question.optionsCount || question.optionsCount < 2) {
      errors.push({
        field: `${prefix}.optionsCount`,
        message: `Question ${index + 1}: At least 2 options required for multiple choice`,
      });
    } else if (question.optionsCount > 10) {
      errors.push({
        field: `${prefix}.optionsCount`,
        message: `Question ${index + 1}: Maximum 10 options allowed`,
      });
    }

    if (!question.optionStyle) {
      errors.push({
        field: `${prefix}.optionStyle`,
        message: `Question ${index + 1}: Option style is required`,
      });
    }

    // Correct options validation
    if (question.correctOptions && question.correctOptions.length > 0) {
      question.correctOptions.forEach(optIndex => {
        if (optIndex < 0 || optIndex >= (question.optionsCount || 0)) {
          errors.push({
            field: `${prefix}.correctOptions`,
            message: `Question ${index + 1}: Correct option index ${optIndex} is out of range`,
          });
        }
      });
    }
  } else if (question.type === 'text') {
    // Text type validation
    if (!question.boxHeight) {
      errors.push({
        field: `${prefix}.boxHeight`,
        message: `Question ${index + 1}: Box height is required for text questions`,
      });
    }
  }

  return errors;
}

/**
 * Validate API key format
 */
export function validateAPIKey(apiKey: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }
  
  const trimmedKey = apiKey.trim();
  
  // OpenAI API keys typically start with "sk-" and can have different formats:
  // - Legacy format: sk-... (48 chars)
  // - Project format: sk-proj-... (longer, varies)
  // Validate that it starts with sk- and has reasonable minimum length
  if (!trimmedKey.startsWith('sk-')) {
    return false;
  }
  
  // Check for specific prefixes and their minimum expected lengths
  if (trimmedKey.startsWith('sk-proj-')) {
    return trimmedKey.length >= 56; // Project keys are longer
  }
  
  // Legacy keys are typically 48-51 characters
  return trimmedKey.length >= 40;
}

/**
 * Validate file size for uploads
 */
export function validateFileSize(sizeInBytes: number, maxSizeMB: number = 20): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

/**
 * Validate file type for uploads
 */
export function validateFileType(mimeType: string, uri: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];
  
  // Check MIME type
  if (allowedTypes.includes(mimeType.toLowerCase())) {
    return true;
  }
  
  // Fallback to extension check
  const extension = uri.toLowerCase().split('.').pop();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
  return allowedExtensions.includes(extension || '');
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Found ${errors.length} validation errors:\n` +
    errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
}
