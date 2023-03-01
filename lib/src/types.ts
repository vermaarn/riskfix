export interface PredictionScores {
  scores: number[];
  averages: number[];
  last_scores: number[];
  times: string[];
}

export interface IAnnotation {
  annotation: string[];
  timestamp: number[];
}

export interface IRecordAnnotation {
  user: string;
  devid: number;
  timestamp: number;
  rounded_timestamp: number;
  annotation: string;
}

export interface IValidation {
  rounded_timestamp: number;
  devid: number;
  user: string;
  prebias_score: number;
  original_risk_score: number;
  validated_risk_score: number;
}

export interface ValidatedScores {
  validated_risk_score: string[];
  rounded_timestamp: string[];
}

export interface IValidation {
  rounded_timestamp: number;
  devid: number;
  user: string;
  prebias_score: number;
  original_risk_score: number;
  validated_risk_score: number;
}
