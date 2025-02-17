export const attachmentStorage = (env: CloudflareBindings) => ({
  get: async ({ emailId, fileId }: { emailId: number; fileId: string }) =>
    await env.KV.get(`attachment:${emailId}:${fileId}`, "arrayBuffer"),
  set: async ({ emailId, fileId, data }: { emailId: number; fileId: string; data: ArrayBuffer }) =>
    env.KV.put(`attachment:${emailId}:${fileId}`, data),
  delete: async ({ emailId, fileId }: { emailId: number; fileId: string }) =>
    env.KV.delete(`attachment:${emailId}:${fileId}`),
});
