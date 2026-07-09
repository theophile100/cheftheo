export interface QcmData {
  options: { id: string; text: string }[];
  correct_option_id: string;
}

export interface AssocierData {
  pairs: {
    left: { id: string; text: string };
    right: { id: string; text: string };
  }[];
}

export interface OrdonnerData {
  steps: { id: string; text: string }[];
}

interface QuestionBase {
  id: string;
  prompt: string;
  explanation: string | null;
}

export type Question =
  | (QuestionBase & { type: "qcm"; data: QcmData })
  | (QuestionBase & { type: "associer"; data: AssocierData })
  | (QuestionBase & { type: "ordonner"; data: OrdonnerData });
