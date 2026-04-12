import { apiRequest, ApiError } from "../api-client";

export interface UploadAvatarResponse {
  avatar: string;
}

/**
 * Загрузить аватар пользователя
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiRequest<UploadAvatarResponse>("/v1/users/avatar", {
    method: "POST",
    body: formData,
    headers: {}, // пустые headers — уберёт Content-Type, браузер поставит multipart/form-data
  }, true);
}

/**
 * Удалить аватар пользователя
 */
export async function deleteAvatar(): Promise<void> {
  await apiRequest<void>("/v1/users/avatar", { method: "DELETE" }, true);
}

export const usersApi = {
  uploadAvatar,
  deleteAvatar,
};
