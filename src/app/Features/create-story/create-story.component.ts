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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-story',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.css'],
})
export class CreateStoryComponent implements OnInit {
  story: StoryCreateViewModel = {
    masjidId: 0,
    contents: [],
    tags: [],
    storyImages: [],
  };

  masjids: MasjidViewModel[] = [];
  languages: LanguageViewModel[] = [];
  tags: string[] = [];
  selectedTags: string[] = [];
  imagePreviews: string[] = [];
  totalFileSize = 0;
  maxFileSizeMB = 10;
  maxFiles = 5;
  fileSizeWarning = '';
  fileCountWarning = '';

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
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadMasjids();
    this.loadLanguages();
    this.loadTags();
    this.translate.onLangChange.subscribe(() => {
      this.loadMasjids();
      this.loadTags();
    });
  }

  loadMasjids(): void {
    this.masjidService.getAllMasjids(this.translate.currentLang).subscribe({
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
        this.languages = languages.filter(
          (lang) => lang.code === 'en' || lang.code === 'ar'
        );
        this.loadingLanguages = false;
        // Initialize contents for each language
        this.story.contents = this.languages.map((lang) => ({
          languageId: lang.id,
          title: '',
          content: '',
        }));
      },
      error: () => {
        this.loadingLanguages = false;
        this.languages = [];
      },
    });
  }

  loadTags(): void {
    this.storyService
      .getAllTags(this.translate.currentLang)
      .then((tags) => {
        this.tags = tags.map((t) => t.localizedName);
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
    this.totalFileSize = 0;
    this.fileSizeWarning = '';
    this.fileCountWarning = '';

    // Validate file count
    if (this.story.storyImages.length > this.maxFiles) {
      this.fileCountWarning = this.translate.instant(
        'CREATE_STORY.FILE_COUNT_WARNING',
        { maxFiles: this.maxFiles }
      );
      this.story.storyImages = this.story.storyImages.slice(0, this.maxFiles);
    }

    // Calculate total file size and validate
    for (let file of this.story.storyImages) {
      this.totalFileSize += file.size;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    }

    const totalSizeMB = this.totalFileSize / (1024 * 1024);
    if (totalSizeMB > this.maxFileSizeMB) {
      this.fileSizeWarning = this.translate.instant(
        'CREATE_STORY.FILE_SIZE_WARNING',
        {
          size: totalSizeMB.toFixed(1),
          maxSize: this.maxFileSizeMB,
        }
      );
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
        this.translate.get('CREATE_STORY.SUCCESS').subscribe((text: string) => {
          this.success = text;
        });
        this.loading = false;
        setTimeout(() => this.router.navigate(['/stories']), 2000);
      })
      .catch((err) => {
        this.error =
          err?.error?.message || this.translate.instant('CREATE_STORY.ERROR');
        this.loading = false;
      });
  }

  isFormValid(): boolean {
    if (!this.story.contents.some((c) => c.title.trim())) {
      this.translate
        .get('CREATE_STORY.TITLE_REQUIRED')
        .subscribe((text: string) => {
          this.error = text;
        });
      return false;
    }
    if (!this.story.contents.some((c) => c.content.trim())) {
      this.translate
        .get('CREATE_STORY.CONTENT_REQUIRED')
        .subscribe((text: string) => {
          this.error = text;
        });
      return false;
    }
    if (!this.story.masjidId || this.story.masjidId === 0) {
      this.translate
        .get('CREATE_STORY.MASJID_REQUIRED')
        .subscribe((text: string) => {
          this.error = text;
        });
      return false;
    }
    if (this.fileSizeWarning) {
      this.error = this.fileSizeWarning;
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
