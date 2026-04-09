import type { Visit } from "./visits";

export type CreateVisitResult =
  | {
      ok: true;
      data: Visit;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export type DeleteVisitResult =
  | {
      ok: true;
      data: undefined;
    }
  | {
      ok: false;
      error: string;
    };
