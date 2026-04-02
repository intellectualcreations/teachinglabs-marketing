/**
 * Cognee HTTP API client utility.
 *
 * The Cognee server is accessed via SSH tunnel.
 * Auth is disabled on the Cognee server — no token needed.
 */

const COGNEE_API_URL =
  process.env.COGNEE_API_URL || 'http://localhost:18000';

// ─── Types ──────────────────────────────────────────────────────────

export interface CogneeSearchParams {
  query: string;
  searchType?:
    | 'GRAPH_COMPLETION'
    | 'CHUNKS'
    | 'RAG_COMPLETION'
    | 'SUMMARIES'
    | 'CHUNKS_LEXICAL'
    | 'TRIPLET_COMPLETION';
  datasets?: string[];
  topK?: number;
}

export interface CogneeAddParams {
  content: string;
  datasetName: string;
}

export interface CogneeHealthResponse {
  status: string;
  health: string;
  version: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

async function cogneeRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${COGNEE_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Cognee API error ${res.status} ${res.statusText}: ${body}`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Search the Cognee knowledge graph.
 */
export async function cogneeSearch(
  params: CogneeSearchParams
): Promise<unknown> {
  return cogneeRequest('/api/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: params.query,
      search_type: params.searchType ?? 'GRAPH_COMPLETION',
      datasets: params.datasets,
      top_k: params.topK,
    }),
  });
}

/**
 * Add content to a Cognee dataset.
 * Uses multipart/form-data with a text file, as required by the API.
 */
export async function cogneeAdd(
  params: CogneeAddParams
): Promise<unknown> {
  const blob = new Blob([params.content], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('data', blob, `${params.datasetName}.txt`);
  formData.append('datasetName', params.datasetName);

  return cogneeRequest('/api/v1/add', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Trigger cognification (knowledge graph processing) for datasets.
 */
export async function cogneeCognify(
  datasets: string[]
): Promise<unknown> {
  return cogneeRequest('/api/v1/cognify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasets }),
  });
}

/**
 * Check Cognee server health.
 */
export async function cogneeHealth(): Promise<CogneeHealthResponse> {
  return cogneeRequest<CogneeHealthResponse>('/health');
}

/**
 * List all available Cognee datasets.
 */
export async function cogneeListDatasets(): Promise<unknown[]> {
  return cogneeRequest<unknown[]>('/api/v1/datasets');
}
