import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../Core/Services/event.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import {
  EventCreateViewModel,
  EventViewModel,
} from '../../Core/Models/event.model';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { AuthService } from '../../Core/Services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
})
export class EditEventComponent implements OnInit {
  eventForm!: FormGroup;

  originalEvent: EventViewModel | null = null;
  masjids: MasjidViewModel[] = [];
  languages: { id: number; code: string; name: string }[] = [
    { id: 1, code: 'en', name: 'English' },
    { id: 2, code: 'ar', name: 'Arabic' },
  ];
  eventId: number = 0;
  loading = false;
  loadingEvent = true;
  loadingMasjids = true;
  loadingLanguages = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private eventService: EventService,
    private masjidService: MasjidService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMasjidsAndThenEvent();
    this.translate.onLangChange.subscribe(() => {
      this.loadMasjidsAndThenEvent();
    });
  }

  // Load masjids first, then event
  loadMasjidsAndThenEvent(): void {
    this.loadingMasjids = true;
    this.masjidService.getAllMasjids(this.translate.currentLang).subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
        if (this.eventId) {
          this.loadEventForEdit();
        } else {
          this.initForm();
        }
      },
      error: (error) => {
        console.error('Error loading masjids:', error);
        this.loadingMasjids = false;
        if (this.eventId) {
          this.loadEventForEdit();
        } else {
          this.initForm();
        }
      },
    });
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      eventDate: ['', Validators.required],
      masjidId: [null],
      contents: this.fb.array([]),
    });
    this.initContentsArray();
  }

  initContentsArray(): void {
    const contentsArray = this.eventForm.get('contents') as FormArray;
    contentsArray.clear();
    this.languages.forEach((lang) => {
      contentsArray.push(
        this.fb.group({
          languageId: [lang.id, Validators.required],
          title: ['', Validators.required],
          description: ['', Validators.required],
        })
      );
    });
  }

  get contentsControls() {
    return (this.eventForm?.get('contents') as FormArray)?.controls || [];
  }

  loadEventForEdit(): void {
    this.loadingEvent = true;
    this.initForm(); // Ensure the form is initialized before patching
    this.eventService.getEventDetails(this.eventId).subscribe({
      next: (event) => {
        this.originalEvent = event;

        // Check if user is the creator
        if (!this.isEventCreator(event)) {
          this.error = 'You can only edit events you created.';
          this.loadingEvent = false;
          return;
        }

        // Patch form with existing data
        this.eventForm.patchValue({
          eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
          masjidId: event.masjidId,
        });
        this.patchContentsArray((event as any).contents || []);

        this.loadingEvent = false;
      },
      error: (error) => {
        this.error = 'Failed to load event for editing';
        this.loadingEvent = false;
        console.error('Error loading event:', error);
      },
    });
  }

  patchContentsArray(contents: any[]): void {
    const contentsArray = this.eventForm.get('contents') as FormArray;
    contentsArray.clear();
    this.languages.forEach((lang) => {
      let existing = contents.find((c) => c.languageId === lang.id);
      // Fallback for legacy events: use localizedTitle/Description for English if no contents
      if (!existing && lang.code === 'en' && this.originalEvent) {
        existing = {
          languageId: lang.id,
          title: this.originalEvent.localizedTitle || '',
          description: this.originalEvent.localizedDescription || '',
        };
      }
      if (!existing) {
        existing = {
          languageId: lang.id,
          title: '',
          description: '',
        };
      }
      contentsArray.push(
        this.fb.group({
          languageId: [lang.id, Validators.required],
          title: [existing.title, Validators.required],
          description: [existing.description, Validators.required],
        })
      );
    });
  }

  isEventCreator(event: EventViewModel): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.userId === event.createdById;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;
    this.loading = true;
    this.error = null;
    this.success = null;
    const formValue = this.eventForm.value;
    const eventToUpdate = {
      eventDate: new Date(formValue.eventDate).toISOString(),
      masjidId: formValue.masjidId,
      contents: formValue.contents,
    };
    this.eventService.updateEvent(this.eventId, eventToUpdate).subscribe({
      next: (response) => {
        this.success = 'Event updated successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/event-details', this.eventId]);
        }, 2000);
      },
      error: (error) => {
        this.error = 'Failed to update event. Please try again.';
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/event-details', this.eventId]);
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }

  loadMasjids(): void {
    this.masjidService.getAllMasjids(this.translate.currentLang).subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
      },
      error: (error) => {
        console.error('Error loading masjids:', error);
        this.loadingMasjids = false;
      },
    });
  }

  // contentsControls getter is already present
}
