import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommunityService } from '../../Core/Services/community.service';
import { LanguageService } from '../../Core/Services/language.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import { CommunityCreateViewModel } from '../../Core/Models/community.model';
import { LanguageViewModel } from '../../Core/Services/language.service';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-community',
  templateUrl: './community-create.component.html',
  styleUrls: ['./community-create.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CreateCommunityComponent implements OnInit {
  communityForm: FormGroup;
  languages: LanguageViewModel[] = [];
  masjids: MasjidViewModel[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Pre-selected masjid from route params
  preselectedMasjidId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private languageService: LanguageService,
    private masjidService: MasjidService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.communityForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
      masjidId: ['', Validators.required],
      languageId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check if masjidId is passed in route params
    this.route.params.subscribe((params) => {
      if (params['masjidId']) {
        this.preselectedMasjidId = +params['masjidId'];
        this.communityForm.get('masjidId')?.setValue(this.preselectedMasjidId);
        this.communityForm.get('masjidId')?.disable();
      }
    });

    this.loadFormData();
  }

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load languages and masjids concurrently
    Promise.all([
      this.languageService.getAllLanguages().toPromise(),
      this.masjidService.getAllMasjids().toPromise(),
    ])
      .then(([languages, masjids]) => {
        this.languages = languages || [];
        this.masjids = masjids || [];

        // Set default language to English if available
        const englishLang = this.languages.find((lang) => lang.code === 'en');
        if (englishLang && !this.communityForm.get('languageId')?.value) {
          this.communityForm.get('languageId')?.setValue(englishLang.id);
        }

        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error loading form data:', error);
        this.errorMessage =
          error.message || 'Failed to load form data. Please try again.';
        this.isLoading = false;
      });
  }

  onSubmit(): void {
    if (this.communityForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData: CommunityCreateViewModel = {
      title: this.communityForm.get('title')?.value?.trim(),
      content: this.communityForm.get('content')?.value?.trim(),
      masjidId: +this.communityForm.get('masjidId')?.value,
      languageId: +this.communityForm.get('languageId')?.value,
    };

    this.communityService.createCommunity(formData).subscribe({
      next: (response) => {
        this.successMessage = response || 'Community created successfully!';
        this.isSubmitting = false;

        // Redirect after a short delay
        setTimeout(() => {
          if (this.preselectedMasjidId) {
            this.router.navigate(['/masjid', this.preselectedMasjidId]);
          } else {
            this.router.navigate(['/my-communities']);
          }
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating community:', error);
        this.errorMessage =
          error.message || 'Failed to create community. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.communityForm.controls).forEach((key) => {
      const control = this.communityForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.communityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.communityForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
      masjidId: 'Masjid',
      languageId: 'Language',
    };
    return displayNames[fieldName] || fieldName;
  }

  onCancel(): void {
    if (this.preselectedMasjidId) {
      this.router.navigate(['/masjid', this.preselectedMasjidId]);
    } else {
      this.router.navigate(['/communities']);
    }
  }
}
