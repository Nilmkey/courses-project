const API_URL = "http://localhost:7777/api/v1";

// lib/api-service.ts
export const courseApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/courses`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API error: ${res.status} - ${error}`);
    }
    const data = await res.json();
    return data.courses || [];
  },

  // Создать
  create: async (data: { title: string; description?: string; level: string; price?: number }) => {
    const res = await fetch(`${API_URL}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API error: ${res.status} - ${error}`);
    }
    return res.json();
  },

  // Удалить
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API error: ${res.status} - ${error}`);
    }
    return res.json();
  },
};
