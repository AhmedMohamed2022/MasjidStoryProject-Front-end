import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../Core/Services/event.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import { EventCreateViewModel } from '../../Core/Models/event.model';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

// You'll need to create this interface or import it from your existing code
// interface LanguageViewModel {
//   id: number;
//   name: string;
//   code: string;
// }

@Component({
  selector: 'app-create-event',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
})
export class CreateEventComponent implements OnInit {
  eventForm!: FormGroup;

  masjids: MasjidViewModel[] = [];
  languages: { id: number; code: string; name: string }[] = [
    { id: 1, code: 'en', name: 'English' },
    { id: 2, code: 'ar', name: 'Arabic' },
  ];
  loading = false;
  loadingMasjids = true;
  loadingLanguages = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private eventService: EventService,
    private masjidService: MasjidService,
    private languageService: LanguageService,
    private router: Router,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadMasjids();
    this.setMinDate();
    this.initForm();
    this.translate.onLangChange.subscribe(() => {
      this.loadMasjids();
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
    return (this.eventForm.get('contents') as FormArray).controls;
  }

  loadMasjids(): void {
    this.masjidService.getAllMasjids(this.translate.currentLang).subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
      },
      error: (error) => {
        this.loadingMasjids = false;
      },
    });
  }

  setMinDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}T00:00`;
    const dateInput = document.getElementById('eventDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = minDate;
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;
    this.loading = true;
    this.error = null;
    this.success = null;
    const formValue = this.eventForm.value;
    const eventToCreate = {
      eventDate: new Date(formValue.eventDate).toISOString(),
      masjidId: formValue.masjidId,
      contents: formValue.contents,
    };
    this.eventService.createEvent(eventToCreate).subscribe({
      next: (response) => {
        this.translate.get('CREATE_EVENT.SUCCESS').subscribe((text: string) => {
          this.success = text;
        });
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/upcoming-events']);
        }, 2000);
      },
      error: (error) => {
        this.translate.get('CREATE_EVENT.ERROR').subscribe((text: string) => {
          this.error = text;
        });
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/upcoming-events']);
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }
}
