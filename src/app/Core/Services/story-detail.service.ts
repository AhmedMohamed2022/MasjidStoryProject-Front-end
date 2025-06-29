// src/app/features/story-detail/story-detail.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  StoryViewModel,
  CommentViewModel,
  CommentCreateViewModel,
  LikeCreateViewModel,
  StoryCreateViewModel,
} from '../../Core/Models/story.model';
import { environment } from '../environments/environment';
import { ApiResponse } from '../Models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  async getStoryById(id: number): Promise<StoryViewModel> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel>(`${this.baseUrl}/story/details/${id}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching story:', error);
      throw error;
    }
  }

  async toggleLike(likeData: LikeCreateViewModel): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/like/toggle`, likeData)
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async addComment(
    commentData: CommentCreateViewModel
  ): Promise<CommentViewModel> {
    try {
      // Add responseType: 'json' explicitly
      const response = await firstValueFrom(
        this.http.post<ApiResponse<CommentViewModel>>(
          `${this.baseUrl}/comment/add`,
          commentData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            responseType: 'json' as const,
          }
        )
      );

      // If response is successful but not in expected format, create a default comment
      if (!response || !response.data) {
        // Create a temporary comment object
        return {
          id: 0, // Server will assign real ID
          content: commentData.content,
          datePosted: new Date().toISOString(),
          userName: 'You', // Or get from AuthService
          storyId: commentData.storyId,
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getRelatedStories(storyId: number): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<StoryViewModel[]>>(
          `${this.baseUrl}/story/related/${storyId}`
        )
      );

      // Return the data array from the ApiResponse
      return response.data || [];
    } catch (error) {
      console.error('Error fetching related stories:', error);
      throw error;
    }
  }

  async getAllStories(): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel[]>(`${this.baseUrl}/story/all`)
      );

      // The backend returns direct array, not wrapped in ApiResponse
      return response || [];
    } catch (error) {
      console.error('Error fetching all stories:', error);
      throw error;
    }
  }

  async getAllTags(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<string[]>(`${this.baseUrl}/tag/all`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  async createStory(story: StoryCreateViewModel): Promise<string> {
    const formData = new FormData();
    formData.append('title', story.title);
    formData.append('content', story.content);
    if (story.masjidId) formData.append('masjidId', story.masjidId.toString());
    if (story.languageId)
      formData.append('languageId', story.languageId.toString());
    story.tags.forEach((tag) => formData.append('tags', tag));
    story.storyImages.forEach((file) => formData.append('storyImages', file));

    try {
      const response = await firstValueFrom(
        this.http.post<string>(`${this.baseUrl}/story/add`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async getPendingStories(): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel[]>(`${this.baseUrl}/story/pending`)
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching pending stories:', error);
      throw error;
    }
  }

  async approveStory(id: number): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<string>>(
          `${this.baseUrl}/story/approve/${id}`,
          {}
        )
      );
      return response.message || 'Story approved.';
    } catch (error) {
      console.error('Error approving story:', error);
      throw error;
    }
  }

  async deleteStory(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/story/delete/${id}`)
      );
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }
}
