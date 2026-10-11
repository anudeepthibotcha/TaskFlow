
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export async function api(path, options = {}) {
  const { method = "GET", body } = options;

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw new Error(
      "Could not connect to TaskFlow API. Check that the backend is running."
    );
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    // The server did not return JSON.
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}
