export const getAdminHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY || "cloudcare_sec_admin_key_998712000011_x9z2a";
  return {
    "X-Admin-API-Key": adminKey,
    ...extraHeaders,
  };
};

export const adminFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = getAdminHeaders((options.headers as Record<string, string>) || {});
  return fetch(url, {
    ...options,
    headers,
  });
};
