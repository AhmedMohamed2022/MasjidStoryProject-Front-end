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
  StoryEditViewModel,
} from '../../Core/Models/story.model';
import { environment } from '../environments/environment';
import { ApiResponse } from '../Models/api-response.model';
import { PaginatedResponse } from '../Models/paginated-response.model';
import { TagViewModel } from '../../Core/Models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  async getStoryById(
    id: number,
    languageCode: string = 'en'
  ): Promise<StoryViewModel> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel>(
          `${this.baseUrl}/story/details/${id}?languageCode=${languageCode}`
        )
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
          contentId: commentData.contentId,
          contentType: commentData.contentType,
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getRelatedStories(
    storyId: number,
    languageCode: string = 'en'
  ): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<StoryViewModel[]>>(
          `${this.baseUrl}/story/related/${storyId}?languageCode=${languageCode}`
        )
      );

      // Return the data array from the ApiResponse
      return response.data || [];
    } catch (error) {
      console.error('Error fetching related stories:', error);
      throw error;
    }
  }

  async getAllStories(languageCode: string = 'en'): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel[]>(
          `${this.baseUrl}/story/all?languageCode=${languageCode}`
        )
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching all stories:', error);
      throw error;
    }
  }

  async getStoriesPaginated(
    page: number = 1,
    size: number = 10,
    languageCode: string = 'en'
  ): Promise<PaginatedResponse<StoryViewModel>> {
    try {
      console.log(`Fetching stories: page=${page}, size=${size}`);
      const response = await firstValueFrom(
        this.http.get<PaginatedResponse<StoryViewModel>>(
          `${this.baseUrl}/story/paginated?page=${page}&size=${size}&languageCode=${languageCode}`
        )
      );

      console.log('Raw pagination response:', response);

      return (
        response || {
          items: [],
          totalCount: 0,
          pageNumber: page,
          pageSize: size,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        }
      );
    } catch (error) {
      console.error('Error fetching paginated stories:', error);
      throw error;
    }
  }

  async getAllTags(languageCode: string = 'en'): Promise<TagViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<TagViewModel[]>(
          `${this.baseUrl}/tag/all?languageCode=${languageCode}`
        )
      );
      return response;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  async createStory(story: StoryCreateViewModel): Promise<string> {
    const formData = new FormData();
    formData.append('masjidId', story.masjidId.toString());
    story.tags.forEach((tag) => formData.append('tags', tag));
    story.storyImages.forEach((file) => formData.append('storyImages', file));
    // Serialize contents array as indexed fields
    story.contents.forEach((content, idx) => {
      formData.append(
        `contents[${idx}].languageId`,
        content.languageId.toString()
      );
      formData.append(`contents[${idx}].title`, content.title);
      formData.append(`contents[${idx}].content`, content.content);
    });

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

  async getPendingStories(
    languageCode: string = 'en'
  ): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel[]>(
          `${this.baseUrl}/story/pending?languageCode=${languageCode}`
        )
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

  async updateStory(id: number, story: StoryEditViewModel): Promise<string> {
    const formData = new FormData();
    formData.append('id', story.id.toString());
    formData.append('masjidId', story.masjidId.toString());
    formData.append('isApproved', story.isApproved.toString());
    // Serialize contents array as indexed fields
    story.contents.forEach((content, idx) => {
      formData.append(
        `contents[${idx}].languageId`,
        content.languageId.toString()
      );
      formData.append(`contents[${idx}].title`, content.title);
      formData.append(`contents[${idx}].content`, content.content);
    });

    // Handle media IDs to keep (not delete)
    if (story.keepMediaIds) {
      story.keepMediaIds.forEach((mediaId) =>
        formData.append('keepMediaIds', mediaId.toString())
      );
    }

    // Handle media IDs to remove
    if (story.removeMediaIds) {
      story.removeMediaIds.forEach((mediaId) =>
        formData.append('removeMediaIds', mediaId.toString())
      );
    }

    // Handle new images
    if (story.newStoryImages) {
      story.newStoryImages.forEach((file) =>
        formData.append('newStoryImages', file)
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<string>>(
          `${this.baseUrl}/story/update/${id}`,
          formData
        )
      );
      return response.message || 'Story updated successfully.';
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  }

  async getUserStories(): Promise<StoryViewModel[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<StoryViewModel[]>(`${this.baseUrl}/story/my-stories`)
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  async deleteStoryMedia(storyId: number, mediaId: number): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<string>>(
          `${this.baseUrl}/story/${storyId}/media/${mediaId}`
        )
      );
      return response.message || 'Media deleted successfully.';
    } catch (error) {
      console.error('Error deleting story media:', error);
      throw error;
    }
  }
}
