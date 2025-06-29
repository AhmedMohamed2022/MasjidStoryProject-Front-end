import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoryService } from '../../Core/Services/story-detail.service';
import { StoryCreateViewModel } from '../../Core/Models/story.model';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-story',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.css'],
})
export class CreateStoryComponent implements OnInit {
  story: StoryCreateViewModel = {
    title: '',
    content: '',
    tags: [],
    storyImages: [],
    masjidId: 0,
    languageId: undefined,
  };

  masjids: MasjidViewModel[] = [];
  languages: LanguageViewModel[] = [];
  tags: string[] = [];
  selectedTags: string[] = [];
  imagePreviews: string[] = [];

  loading = false;
  loadingMasjids = true;
  loadingLanguages = true;
  loadingTags = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private storyService: StoryService,
    private masjidService: MasjidService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMasjids();
    this.loadLanguages();
    this.loadTags();
  }

  loadMasjids(): void {
    this.masjidService.getAllMasjids().subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
      },
      error: () => {
        this.loadingMasjids = false;
        this.masjids = [];
      },
    });
  }

  loadLanguages(): void {
    this.languageService.getAllLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
        this.loadingLanguages = false;
      },
      error: () => {
        this.loadingLanguages = false;
        this.languages = [];
      },
    });
  }

  loadTags(): void {
    this.storyService
      .getAllTags()
      .then((tags) => {
        this.tags = tags;
        this.loadingTags = false;
      })
      .catch(() => {
        this.tags = [];
        this.loadingTags = false;
      });
  }

  onTagToggle(tag: string): void {
    if (this.story.tags.includes(tag)) {
      this.story.tags = this.story.tags.filter((t) => t !== tag);
    } else {
      this.story.tags.push(tag);
    }
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    this.story.storyImages = Array.from(files);
    this.imagePreviews = [];
    for (let file of this.story.storyImages) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.loading = true;
    this.error = null;
    this.success = null;
    this.storyService
      .createStory(this.story)
      .then((msg) => {
        this.success = msg || 'Story submitted and pending approval.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/stories']), 2000);
      })
      .catch(() => {
        this.error = 'Failed to submit story. Please try again.';
        this.loading = false;
      });
  }

  isFormValid(): boolean {
    if (!this.story.title.trim()) {
      this.error = 'Title is required';
      return false;
    }
    if (!this.story.content.trim()) {
      this.error = 'Content is required';
      return false;
    }
    if (!this.story.masjidId || this.story.masjidId === 0) {
      this.error = 'Please select a masjid';
      return false;
    }
    return true;
  }

  onCancel(): void {
    this.router.navigate(['/stories']);
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }
}
