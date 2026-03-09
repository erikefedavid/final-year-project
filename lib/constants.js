export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for JPG/PNG

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];

export const SUMMARY_TYPES = {
  brief: {
    label: "Brief",
    description: "2-3 sentence overview",
    prompt: "Summarize the following text in 2-3 concise sentences. Capture only the most essential points.",
  },
  detailed: {
    label: "Detailed",
    description: "Comprehensive summary",
    prompt: "Provide a comprehensive and detailed summary of the following text. Cover all main points, key arguments, and important details. Structure your summary with clear paragraphs.",
  },
  bullets: {
    label: "Bullet Points",
    description: "Key points as a list",
    prompt: "Extract the key points from the following text and present them as a clear bullet point list. Each bullet should be a complete, standalone point.",
  },
  "key-terms": {
    label: "Key Terms",
    description: "Important terms and definitions",
    prompt: "Identify and define all key terms, concepts, and definitions found in the following text. Format each as: Term: Definition.",
  },
  "study-notes": {
    label: "Study Notes",
    description: "Formatted for studying",
    prompt: "Convert the following text into well-organized study notes. Use headers for main topics, bullet points for details, and highlight key terms. Make it easy to review for an exam.",
  },
};
