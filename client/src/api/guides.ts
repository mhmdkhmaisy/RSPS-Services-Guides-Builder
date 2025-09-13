import { apiRequest } from "@/lib/queryClient";
import type { GuideWithTags, InsertGuide } from "@shared/schema";

export const guidesApi = {
  getGuides: async (params?: { search?: string; tag?: string }): Promise<GuideWithTags[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.tag) searchParams.append('tag', params.tag);
    
    const url = `/api/guides${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  getGuide: async (id: string): Promise<GuideWithTags> => {
    const response = await apiRequest("GET", `/api/guides/${id}`);
    return response.json();
  },

  getGuideBySlug: async (slug: string): Promise<GuideWithTags> => {
    const response = await apiRequest("GET", `/api/guides/slug/${slug}`);
    return response.json();
  },

  createGuide: async (guide: InsertGuide & { tagIds?: string[] }): Promise<GuideWithTags> => {
    const response = await apiRequest("POST", "/api/guides", guide);
    return response.json();
  },

  updateGuide: async (id: string, guide: Partial<InsertGuide> & { tagIds?: string[] }): Promise<GuideWithTags> => {
    const response = await apiRequest("PUT", `/api/guides/${id}`, guide);
    return response.json();
  },

  deleteGuide: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/guides/${id}`);
  },

  exportGuide: async (id: string): Promise<Blob> => {
    const response = await fetch(`/api/guides/${id}/export`);
    if (!response.ok) {
      throw new Error('Failed to export guide');
    }
    return response.blob();
  },
};
