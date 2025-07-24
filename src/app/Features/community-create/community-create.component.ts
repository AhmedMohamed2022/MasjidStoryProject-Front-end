import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommunityService } from '../../Core/Services/community.service';
import { LanguageService } from '../../Core/Services/language.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import { CommunityCreateViewModel } from '../../Core/Models/community.model';
import { LanguageViewModel } from '../../Core/Services/language.service';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-community',
  templateUrl: './community-create.component.html',
  styleUrls: ['./community-create.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class CreateCommunityComponent implements OnInit {
  communityForm: FormGroup;
  languages: LanguageViewModel[] = [];
  masjids: MasjidViewModel[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  preselectedMasjidId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private languageService: LanguageService,
    private masjidService: MasjidService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.communityForm = this.fb.group({
      masjidId: [{ value: '', disabled: false }, Validators.required],
      contents: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['masjidId']) {
        this.preselectedMasjidId = +params['masjidId'];
        this.communityForm.get('masjidId')?.setValue(this.preselectedMasjidId);
        this.communityForm.get('masjidId')?.disable();
      }
    });
    this.loadFormData();
    this.translate.onLangChange.subscribe(() => {});
  }

  getMasjidDisplayName(masjid: MasjidViewModel): string {
    const lang = this.translate.currentLang || 'en';
    if (!masjid.contents || masjid.contents.length === 0) return '';
    const langId = lang === 'ar' ? 2 : 1;
    const found = masjid.contents.find((c) => c.languageId === langId);
    return found?.name || masjid.contents[0].name;
  }

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    Promise.all([
      this.languageService.getAllLanguages().toPromise(),
      this.masjidService.getAllMasjids().toPromise(),
    ])
      .then(([languages, masjids]) => {
        this.languages = (languages || []).filter(
          (lang) => lang.code === 'en' || lang.code === 'ar'
        );
        this.masjids = masjids || [];
        console.log('Masjids loaded:', this.masjids);
        // Initialize contents FormArray for both languages
        const contentsArray = this.communityForm.get('contents') as FormArray;
        contentsArray.clear();
        this.languages.forEach((lang) => {
          contentsArray.push(
            this.fb.group({
              languageId: [lang.id, Validators.required],
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
            })
          );
        });
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error loading form data:', error);
        this.errorMessage =
          error.message || 'Failed to load form data. Please try again.';
        this.isLoading = false;
      });
  }

  get contents(): FormArray {
    return this.communityForm.get('contents') as FormArray;
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
      masjidId: +this.communityForm.get('masjidId')?.value,
      contents: this.contents.value.map((c: any) => ({
        languageId: c.languageId,
        title: c.title?.trim(),
        content: c.content?.trim(),
      })),
    };
    this.communityService.createCommunity(formData).subscribe({
      next: (response) => {
        this.translate
          .get('COMMUNITY_CREATE.SUCCESS')
          .subscribe((text: string) => {
            this.successMessage = text;
          });
        this.isSubmitting = false;
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
        this.translate
          .get('COMMUNITY_CREATE.ERROR')
          .subscribe((text: string) => {
            this.errorMessage = text;
          });
        this.isSubmitting = false;
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.communityForm.controls).forEach((key) => {
      const control = this.communityForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach((group) => group.markAllAsTouched());
      } else {
        control?.markAsTouched();
      }
    });
  }

  isFieldInvalid(contentIndex: number, fieldName: string): boolean {
    const contentGroup = this.contents.at(contentIndex) as FormGroup;
    const field = contentGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(contentIndex: number, fieldName: string): string {
    const contentGroup = this.contents.at(contentIndex) as FormGroup;
    const field = contentGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        if (fieldName === 'title') {
          let errorMsg = '';
          this.translate
            .get('COMMUNITY_CREATE.TITLE_REQUIRED')
            .subscribe((text: string) => (errorMsg = text));
          return errorMsg;
        }
        if (fieldName === 'content') {
          let errorMsg = '';
          this.translate
            .get('COMMUNITY_CREATE.DESCRIPTION_REQUIRED')
            .subscribe((text: string) => (errorMsg = text));
          return errorMsg;
        }
        return this.getFieldDisplayName(fieldName) + ' is required';
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

  getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
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

  asFormControl(ctrl: AbstractControl | null): FormControl {
    return ctrl as FormControl;
  }
}
