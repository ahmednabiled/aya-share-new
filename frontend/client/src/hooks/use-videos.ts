import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredToken } from "@/contexts/AuthContext";
import type { Video, VideosResponse, VideoResponse } from "@/types/api";

const API_URL = "/api/v1";

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  if (!token) {
    throw new Error("You must be signed in to perform this action.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers,
  });
};

// Get all videos for current user
export function useVideos() {
  const token = getStoredToken();
  
  return useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      const res = await authFetch(`${API_URL}/video/allVidoes`);

      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }

      const json: VideosResponse = await res.json();
      return json.data?.videos ?? [];
    },
    enabled: !!token, // Only fetch if token exists
  });
}

// Get single video by ID
export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async (): Promise<Video | null> => {
      const res = await authFetch(`${API_URL}/video/video/${id}`);

      if (!res.ok) {
        return null;
      }

      const json: VideoResponse = await res.json();
      return json.data?.video ?? null;
    },
    enabled: !!id,
  });
}

// Create video from audio file
export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audioFile: File): Promise<Video> => {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const res = await authFetch(`${API_URL}/video/createVideo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create video");
      }

      const json: VideoResponse = await res.json();
      if (!json.data?.video) {
        throw new Error("No video returned");
      }
      return json.data.video;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// Delete video
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string): Promise<void> => {
      const res = await authFetch(`${API_URL}/video/deleteVideo/${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete video");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
