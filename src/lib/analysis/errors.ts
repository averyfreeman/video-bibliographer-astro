/** Stable failure categories for bibliography analysis. */
export type AnalysisErrorCode =
  | 'missing-key'
  | 'invalid-config'
  | 'malformed-output'
  | 'schema-invalid'
  | 'provider';

/** User-safe, typed failure from the analysis boundary. */
export class AnalysisError extends Error {
  /** Stable machine-readable analysis failure category. */
  readonly code: AnalysisErrorCode;
  /** Whether retrying may succeed without changing the input. */
  readonly retryable: boolean;

  /**
   * Creates an analysis error while retaining an optional server-side cause.
   * @param code Stable failure category.
   * @param message Safe diagnostic that excludes credentials and raw model output.
   * @param cause Optional internal cause.
   */
  constructor(code: AnalysisErrorCode, message: string, cause?: unknown) {
    super(message);
    if (cause !== undefined) this.cause = cause;
    this.name = 'AnalysisError';
    this.code = code;
    this.retryable = code === 'provider';
  }
}
