import "server-only";

export const VISIT_SELECT_COLUMNS =
  "id, visitor_name, couple, date_from, date_to, note, author_id, created_at, author:profiles!author_id (display_name), couple_details:couples!couple (label)";
