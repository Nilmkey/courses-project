const API_URL = "http://localhost:7777/api";

export const courseApi = {
  // Получить все
  getAll: () => fetch(`${API_URL}/courses`).then(res => res.json()),
  
  // Создать
  create: (data: any) => fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json()),

  // Удалить
  delete: (id: string) => fetch(`${API_URL}/courses/${id}`, {
    method: "DELETE",
  }).then(res => res.json()),
};