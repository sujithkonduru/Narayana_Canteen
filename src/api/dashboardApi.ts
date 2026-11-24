export type ApiPaginatedResponse<T> = {
  success?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
  };
  data?: T[];
  items?: T[];
  results?: T[];
};

export const normalizeListResponse = <T>(payload?: ApiPaginatedResponse<T> | T[] | null): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  if (!payload) return [];

  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload.items)) return payload.items as T[];
  if (Array.isArray(payload.results)) return payload.results as T[];

  return [];
};

const PAGE_SIZE = 500; // records requested per page
const MAX_PAGES = 200; // safety guard against infinite loops

// Fetches EVERY page of a paginated endpoint and returns all records combined.
const fetchAllRecords = async <T = any>(
  endpoint: string,
  date: string,
  hallId: string
): Promise<T[]> => {
  const buildUrl = (page: number) =>
    `${endpoint}?date=${encodeURIComponent(date)}&hallId=${encodeURIComponent(hallId)}` +
    `&page=${page}&limit=${PAGE_SIZE}`;

  const fetchPage = async (page: number): Promise<ApiPaginatedResponse<T> | T[]> => {
    const res = await fetch(buildUrl(page), {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  };

  const first = await fetchPage(1);
  const all: T[] = [...normalizeListResponse<T>(first)];

  // Plain array response => backend is not paginated, we already have everything
  if (Array.isArray(first)) return all;

  const totalPages = Math.min(first?.pagination?.totalPages ?? 1, MAX_PAGES);
  if (totalPages <= 1) return all;

  // Fetch remaining pages in parallel
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2))
  );
  rest.forEach((payload) => all.push(...normalizeListResponse<T>(payload)));

  return all;
};

export const fetchKnownData = async <T = any>(
  date: string,
  hallId: string,
  _page?: number,
  _limit?: number
): Promise<T[]> => fetchAllRecords<T>('/getData/known-data', date, hallId);

export const fetchUnknownData = async <T = any>(
  date: string,
  hallId: string,
  _page?: number,
  _limit?: number
): Promise<T[]> => fetchAllRecords<T>('/getData/unknown-data', date, hallId);