
export type AnswerStatus =
  | "answered"
  | "cancelled"
  | "empty_response"
  | "ui_unavailable";

export interface AnswerResult {
  status: AnswerStatus;
  answer?: string;
  message: string;
}

export function resolveAnswer(
  selected: string | undefined,
  customAnswer?: string
): AnswerResult {
  if (selected === undefined) {
    return {
      status: "cancelled",
      message: "The user cancelled the question.",
    };
  }

  const answer =
    selected === "Other" ? customAnswer?.trim() : selected.trim();

  if (!answer) {
    return {
      status: "empty_response",
      message: "No answer was provided.",
    };
  }

  return {
    status: "answered",
    answer,
    message: `User chose: ${answer}`,
  };
}

export function unavailableUI(): AnswerResult {
  return {
    status: "ui_unavailable",
    message: "Interactive UI unavailable. Do not guess.",
  };
}
