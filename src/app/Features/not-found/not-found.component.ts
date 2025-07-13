import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section class="section-padding bg-light-emerald not-found-section">
      <div class="container">
        <div class="section-header text-center mb-5">
          <div class="islamic-pattern-bg mx-auto mb-4">
            <i class="fas fa-mosque hero-icon"></i>
          </div>
          <h1 class="section-title">{{ 'NOT_FOUND_TITLE' | translate }}</h1>
          <p class="section-subtitle">
            {{ 'NOT_FOUND_SUBTITLE' | translate }}
          </p>
        </div>
        <div class="text-center mt-4">
          <a routerLink="/home" class="btn btn-gold btn-lg">
            <i class="fas fa-home me-2"></i>
            {{ 'NOT_FOUND_GO_HOME' | translate }}
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .not-found-section {
        min-height: 70vh;
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      }
      .islamic-pattern-bg {
        width: 120px;
        height: 120px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
        border: 2px solid #e9ecef;
      }
      .hero-icon {
        font-size: 4rem;
        color: #c2a25d;
      }
      .section-title {
        color: #053426;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      .section-subtitle {
        color: #185542;
        font-size: 1.1rem;
        opacity: 0.85;
      }
      .btn.btn-gold {
        background: #c2a25d;
        color: #fff;
        border: none;
        font-weight: 600;
        border-radius: 8px;
        padding: 0.75rem 2.5rem;
        font-size: 1.2rem;
        transition: background 0.2s;
      }
      .btn.btn-gold:hover {
        background: #ad8d49;
        color: #fff;
      }
      @media (max-width: 768px) {
        .section-title {
          font-size: 2rem;
        }
        .islamic-pattern-bg {
          width: 80px;
          height: 80px;
        }
        .hero-icon {
          font-size: 2.5rem;
        }
      }
    `,
  ],
})
export class NotFoundComponent {}
