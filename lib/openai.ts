import type {
  ExamConfig,
  OptionStyle,
  QuestionType,
  TextBoxHeight,
} from "@/types/exam";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ResponseInputContent,
  ResponseInputItem,
} from "openai/resources/responses/responses";
import { z } from "zod";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/constants/keys";
import { logger } from "@/lib/logger";

// --- Configuration Helper ---

async function getAppConfig() {
  const storedKey = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
  const storedModel = await AsyncStorage.getItem(STORAGE_KEYS.MODEL_NAME);

  // Create a new client every time to ensure fresh settings
  const apiKey = storedKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const modelName = storedModel || DEFAULT_SETTINGS.MODEL_NAME;

  const debug = await AsyncStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
  if (debug === "true") {
    console.log(
      `[DEBUG] Config loaded. Model: ${modelName}, Key exists: ${!!apiKey}`,
    );
  }

  if (!apiKey) {
    throw new Error(
      "API Key not configured. Please set it in Settings tab or use EXPO_PUBLIC_OPENAI_API_KEY.",
    );
  }

  return {
    client: new OpenAI({ apiKey, dangerouslyAllowBrowser: true }),
    model: modelName,
    apiKey,
  };
}

// --- Schemas ---

const questionTypeSchema = z.enum(["mark", "text"] satisfies [
  QuestionType,
  QuestionType,
]);
const optionStyleSchema = z.enum([
  "number",
  "alphabet",
  "kana",
  "iroha",
] satisfies [OptionStyle, OptionStyle, OptionStyle, OptionStyle]);
const textBoxHeightSchema = z.enum(["small", "medium", "large"] satisfies [
  TextBoxHeight,
  TextBoxHeight,
  TextBoxHeight,
]);

const markQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  points: z.number().int().min(0).default(0),
  type: z.literal("mark"),
  optionsCount: z.number().int().min(2).max(10).default(4),
  optionStyle: optionStyleSchema.default("alphabet"),
  correctOptions: z.array(z.number().int().min(0)).default([]),
});

const textQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  points: z.number().int().min(0).default(0),
  type: z.literal("text"),
  boxHeight: textBoxHeightSchema.default("medium"),
});

const examConfigSchema = z.object({
  title: z.string().min(1).default("Untitled Exam"),
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        points: z.number().int().min(0).default(0),
        type: questionTypeSchema,
        optionsCount: z.number().int().min(2).max(10).nullable(),
        optionStyle: optionStyleSchema.nullable(),
        correctOptions: z.array(z.number().int().min(0)).nullable(),
        boxHeight: textBoxHeightSchema.nullable(),
      }),
    )
    .default([]),
});

const visionGradeSchema = z.object({
  results: z.array(
    z.object({
      id: z.string().min(1),
      filled: z.array(z.number().int().min(0)).nullable(),
    }),
  ),
});

export interface VisionGradeResult {
  id: string;
  filled: number[] | null;
}

export interface LocalInputFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

// --- Helpers ---

async function logDebug(message: string, data?: any) {
  try {
    const debug = await AsyncStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
    if (debug === "true") {
      console.log(
        `[DEBUG] ${message}`,
        data !== undefined ? JSON.stringify(data, null, 2) : "",
      );
      // Also send to in-app logger if available
      logger.addLog(message, data);
    }
  } catch {}
}

async function parseResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  schemaName: string,
  instructions: string,
  input: string | ResponseInputItem[],
): Promise<z.infer<TSchema>> {
  const { client, model } = await getAppConfig();

  await logDebug("Calling OpenAI Structured Outputs", {
    model,
    instructions: instructions.slice(0, 100) + "...",
    inputIsArray: Array.isArray(input),
    schemaName,
  });

  try {
    const response = await client.responses.parse({
      model: model,
      instructions,
      input,
      text: {
        format: zodTextFormat(schema, schemaName),
      },
    });

    await logDebug("OpenAI Response Received", {
      output_parsed: !!response.output_parsed,
      refusal: (response as any).refusal,
    });

    if (!response.output_parsed) {
      const errorMsg =
        (response as any).refusal || "OpenAI response has no parsed output.";
      await logDebug("OpenAI Parse Error/Refusal", errorMsg);
      throw new Error(errorMsg);
    }

    return response.output_parsed;
  } catch (e) {
    await logDebug("OpenAI API Exception", e);
    throw e;
  }
}

function isImageMimeType(mimeType?: string | null): boolean {
  return Boolean(mimeType && mimeType.startsWith("image/"));
}

async function uploadFileToOpenAI(file: LocalInputFile): Promise<string> {
  const { apiKey } = await getAppConfig();

  await logDebug("Uploading file to OpenAI", {
    name: file.name,
    type: file.mimeType,
    size: file.uri.length,
  });

  const formData = new FormData();
  formData.append("purpose", "user_data");

  // React Native uses uri-based file parts for FormData
  formData.append("file", {
    uri: file.uri,
    name: file.name || "upload.bin",
    type: file.mimeType || "application/octet-stream",
  } as unknown as Blob);

  // We need to use raw fetch here because OpenAI Node SDK doesn't support RN File object well for uploads yet
  // But since we have the apiKey from getAppConfig, we can use it.

  // Adjusted to use the apiKey returned from config directly
  if (!apiKey) throw new Error("API Key missing");

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`File upload failed: ${response.status} ${text}`);
  }

  const uploaded = (await response.json()) as { id?: string };
  if (!uploaded.id) {
    throw new Error("File upload response missing id.");
  }
  return uploaded.id;
}

async function createFileInputContent(
  file: LocalInputFile,
): Promise<ResponseInputContent> {
  const fileId = await uploadFileToOpenAI(file);

  if (isImageMimeType(file.mimeType)) {
    return {
      type: "input_image",
      file_id: fileId,
      detail: "high",
    };
  }

  return {
    type: "input_file",
    file_id: fileId,
  };
}

function toExamConfig(value: z.infer<typeof examConfigSchema>): ExamConfig {
  return {
    title: value.title,
    questions: value.questions.map((question) => {
      if (question.type === "mark") {
        return {
          id: question.id,
          label: question.label,
          points: question.points,
          type: questionTypeSchema.parse(question.type),
          optionsCount: question.optionsCount ?? 4,
          optionStyle: question.optionStyle ?? "alphabet",
          correctOptions: question.correctOptions ?? [],
        };
      }
      return {
        id: question.id,
        label: question.label,
        points: question.points,
        type: questionTypeSchema.parse(question.type),
        boxHeight: question.boxHeight ?? "medium",
      };
    }),
  };
}

// --- Exported Functions ---

const COMMON_INSTRUCTIONS = [
  "You convert exam text/images/files into structured JSON for a marksheet grading system.",
  'Return schema: { "title": string, "questions": Question[] }.',
  "",
  "CRITICAL RULES FOR QUESTION PARSING:",
  "1. Each individual answer bubble/option set = ONE separate question entry.",
  "2. If a question says 'イ~ハまでそれぞれ選べ' or 'A to D', create MULTIPLE questions: one for each sub-part.",
  "3. EXPAND RANGES: 'イ～ニ' becomes questions for イ, ロ, ハ, ニ. '1～3' becomes questions 1, 2, 3.",
  "4. Use labels like '1-イ', '1-ロ' or '問1(1)', '問1(2)' for sub-questions.",
  "5. Never combine multiple answer bubbles into one question.",
  "6. If an Answer Key source is provided, use it to populate 'correctOptions'. It is an array of 0-based indices.",
  "7. If multiple answers are correct, include all of them in 'correctOptions'.",
  "",
  'Question type must be "mark" (multiple choice) or "text" (written answer).',
  "For mark questions include optionsCount, optionStyle, and correctOptions (array of 0-based indices).",
  'For text questions include boxHeight ("small" | "medium" | "large").',
  "Set stable unique IDs (q1, q1a, q1b, etc.) for each question.",
].join("\n");

export async function generateExamConfigFromText(
  inputText: string,
): Promise<ExamConfig> {
  const parsed = await parseResponse(
    examConfigSchema,
    "exam_config",
    COMMON_INSTRUCTIONS,
    `Build an exam config from the following source text:\n${inputText}`,
  );
  return toExamConfig(parsed);
}

export async function generateExamConfigFromImageUrl(
  imageUrl: string,
  answerImageUrl?: string,
): Promise<ExamConfig> {
  const content: any[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Build an exam config from this image.",
        },
        {
          type: "input_image",
          image_url: imageUrl,
          detail: "high",
        },
      ],
    },
  ];

  if (answerImageUrl) {
    const contentArray = content[0].content as any[];
    contentArray.push({
      type: "input_text",
      text: "Below is the ANSWER KEY/SOURCE for the exam above:",
    });
    contentArray.push({
      type: "input_image",
      image_url: answerImageUrl,
      detail: "high",
    });
  }

  const parsed = await parseResponse(
    examConfigSchema,
    "exam_config",
    COMMON_INSTRUCTIONS,
    content,
  );
  return toExamConfig(parsed);
}

export async function generateExamConfigFromFile(
  file: LocalInputFile,
  answerFile?: LocalInputFile,
): Promise<ExamConfig> {
  const fileContent = await createFileInputContent(file);
  const content: any[] = [
    {
      type: "input_text",
      text: "Build an exam config from this uploaded source file.",
    },
    fileContent,
  ];

  if (answerFile) {
    const answerContent = await createFileInputContent(answerFile);
    content.push({
      type: "input_text",
      text: "Below is the ANSWER KEY/SOURCE for the exam above:",
    });
    content.push(answerContent);
  }

  const parsed = await parseResponse(
    examConfigSchema,
    "exam_config",
    COMMON_INSTRUCTIONS,
    [
      {
        role: "user",
        content: content,
      },
    ],
  );

  return toExamConfig(parsed);
}

export async function gradeByVision(
  imageUrl: string,
  exam: ExamConfig,
): Promise<VisionGradeResult[]> {
  const markQuestions = exam.questions
    .filter((question) => question.type === "mark")
    .map((question) => ({
      id: question.id,
      label: question.label,
      optionsCount: question.optionsCount ?? 4,
    }));

  if (markQuestions.length === 0) {
    return [];
  }

  const parsed = await parseResponse(
    visionGradeSchema,
    "vision_grade_results",
    [
      "You are a marksheet grader.",
      'Return only a JSON array of { "id": string, "filled": number[] | null }.',
      "filled must be an array of ALL 0-based selected option indices. If nothing is selected, return null or empty array.",
      "Do not return IDs that are not in the provided schema.",
    ].join("\n"),
    [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              "Detect selected options for each question in this marksheet image.",
              `Question schema: ${JSON.stringify(markQuestions)}`,
            ].join("\n"),
          },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "high",
          },
        ],
      },
    ],
  );

  const optionMap = new Map(
    markQuestions.map((question) => [question.id, question.optionsCount]),
  );
  return parsed.results
    .map((item) => {
      const optionsCount = optionMap.get(item.id);
      if (typeof optionsCount !== "number") {
        return null;
      }
      const max = optionsCount - 1;
      // Filter out invalid indices
      const validFilled = item.filled?.filter((idx) => idx >= 0 && idx <= max) ?? [];
      const filled = validFilled.length > 0 ? validFilled : null;
      return { id: item.id, filled };
    })
    .filter((item): item is VisionGradeResult => item !== null);
}

export async function gradeByVisionFromFile(
  file: LocalInputFile,
  exam: ExamConfig,
): Promise<VisionGradeResult[]> {
  const markQuestions = exam.questions
    .filter((question) => question.type === "mark")
    .map((question) => ({
      id: question.id,
      label: question.label,
      optionsCount: question.optionsCount ?? 4,
    }));

  if (markQuestions.length === 0) {
    return [];
  }

  const fileContent = await createFileInputContent(file);
  const parsed = await parseResponse(
    visionGradeSchema,
    "vision_grade_results",
    [
      "You are a marksheet grader.",
      'Return only a JSON array of { "id": string, "filled": number[] | null }.',
      "filled must be an array of ALL 0-based selected option indices. If nothing is selected, return null or empty array.",
      "Do not return IDs that are not in the provided schema.",
    ].join("\n"),
    [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              "Detect selected options for each question in this marksheet file.",
              `Question schema: ${JSON.stringify(markQuestions)}`,
            ].join("\n"),
          },
          fileContent,
        ],
      },
    ],
  );

  const optionMap = new Map(
    markQuestions.map((question) => [question.id, question.optionsCount]),
  );
  return parsed.results
    .map((item) => {
      const optionsCount = optionMap.get(item.id);
      if (typeof optionsCount !== "number") {
        return null;
      }
      const max = optionsCount - 1;
      // Filter out invalid indices
      const validFilled = item.filled?.filter((idx) => idx >= 0 && idx <= max) ?? [];
      const filled = validFilled.length > 0 ? validFilled : null;
      return { id: item.id, filled };
    })
    .filter((item): item is VisionGradeResult => item !== null);
}
