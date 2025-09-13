import { apiRequest } from "@/lib/queryClient";
import type { Tag, InsertTag } from "@shared/schema";

export const tagsApi = {
  getTags: async (): Promise<Tag[]> => {
    const response = await apiRequest("GET", "/api/tags");
    return response.json();
  },

  getTag: async (id: string): Promise<Tag> => {
    const response = await apiRequest("GET", `/api/tags/${id}`);
    return response.json();
  },

  createTag: async (tag: InsertTag): Promise<Tag> => {
    const response = await apiRequest("POST", "/api/tags", tag);
    return response.json();
  },

  updateTag: async (id: string, tag: Partial<InsertTag>): Promise<Tag> => {
    const response = await apiRequest("PUT", `/api/tags/${id}`, tag);
    return response.json();
  },

  deleteTag: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/tags/${id}`);
  },
};
