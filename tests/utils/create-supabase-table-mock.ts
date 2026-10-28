type Row = Record<string, unknown>;

export type RecordedCall = [method: string, ...args: unknown[]];

export interface RecordedQuery {
  table: string;
  calls: RecordedCall[];
}

interface SelectOptions {
  count?: "exact";
  head?: boolean;
}

interface QueryResult {
  data: Row[] | null;
  error: { message: string } | null;
  count: number | null;
}

class TableQueryMock {
  private filters: Array<(row: Row) => boolean> = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private maxRows: number | null = null;
  private selectOptions: SelectOptions = {};

  constructor(
    private readonly rows: Row[],
    private readonly error: { message: string } | null,
    private readonly recorded: RecordedQuery,
  ) {}

  select(columns: string, options: SelectOptions = {}) {
    this.recorded.calls.push(["select", columns, options]);
    this.selectOptions = options;
    return this;
  }

  eq(column: string, value: unknown) {
    this.recorded.calls.push(["eq", column, value]);
    this.filters.push((row) => row[column] === value);
    return this;
  }

  gte(column: string, value: string) {
    this.recorded.calls.push(["gte", column, value]);
    this.filters.push((row) => String(row[column]) >= value);
    return this;
  }

  order(column: string, options: { ascending: boolean }) {
    this.recorded.calls.push(["order", column, options]);
    this.sort = { column, ascending: options.ascending };
    return this;
  }

  limit(count: number) {
    this.recorded.calls.push(["limit", count]);
    this.maxRows = count;
    return this;
  }

  then<TResult>(
    onFulfilled: (result: QueryResult) => TResult | PromiseLike<TResult>,
    onRejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
  ): Promise<TResult> {
    return Promise.resolve(this.execute()).then(onFulfilled, onRejected);
  }

  private execute(): QueryResult {
    if (this.error) {
      return { data: null, error: this.error, count: null };
    }

    const matching = this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );

    if (this.sort) {
      const { column, ascending } = this.sort;
      matching.sort((left, right) => {
        const delta = String(left[column]).localeCompare(String(right[column]));
        return ascending ? delta : -delta;
      });
    }

    const count = this.selectOptions.count === "exact" ? matching.length : null;
    const data = this.selectOptions.head
      ? null
      : matching.slice(0, this.maxRows ?? undefined);

    return { data, error: null, count };
  }
}

export function createSupabaseTableMock(
  tables: Record<string, Row[]>,
  errors: Record<string, { message: string }> = {},
) {
  const queries: RecordedQuery[] = [];

  return {
    queries,
    client: {
      from(table: string) {
        const recorded: RecordedQuery = { table, calls: [] };
        queries.push(recorded);
        return new TableQueryMock(
          tables[table] ?? [],
          errors[table] ?? null,
          recorded,
        );
      },
    },
  };
}
