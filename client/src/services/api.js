const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  deleteAccount: () => request("/auth/account", { method: "DELETE" }),
  listPuzzles: (difficulty) =>
    request(`/puzzles${difficulty ? `?difficulty=${difficulty}` : ""}`),
  getPuzzle: (id) => request(`/puzzles/${id}`),
  createPuzzle: (payload) => request("/puzzles", { method: "POST", body: JSON.stringify(payload) }),
  solvePuzzle: (id, payload) =>
    request(`/puzzles/${id}/solve`, { method: "POST", body: JSON.stringify(payload) }),
  hint: (id, payload) =>
    request(`/puzzles/${id}/hint`, { method: "POST", body: JSON.stringify(payload) }),
  autosolve: (id) => request(`/puzzles/${id}/autosolve`),
  ratePuzzle: (id, payload) =>
    request(`/puzzles/${id}/rating`, { method: "POST", body: JSON.stringify(payload) }),
  highscores: (puzzleId) =>
    request(`/highscores${puzzleId ? `?puzzleId=${puzzleId}` : ""}`),
  rules: () => request("/rules"),
};
