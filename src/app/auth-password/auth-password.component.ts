import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService } from '../test-state.service';

type Step = 'form' | 'loading' | 'success';

@Component({
  selector: 'app-auth-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-password.component.html',
  styleUrl: './auth-password.component.scss'
})
export class AuthPasswordComponent implements OnInit, OnDestroy {
  password = '';
  step: Step = 'form';
  showPassword = false;
  validationMessage = '';
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Method ${this.state.currentIndex + 1} of ${this.state.shuffledMethods.length}`;
  }

  ngOnInit(): void {
    if (!this.state.hasActiveMethod || this.state.currentMethod.key !== 'password') {
      this.router.navigate(['/']);
      return;
    }

    this.state.beginCurrentMethod();
  }

  login(): void {
    this.state.registerInteraction();
    this.validationMessage = '';

    if (this.password.trim().length < 1) {
      this.state.registerFailure();
      this.validationMessage = 'Enter the session password to continue.';
      return;
    }

    if (this.password !== this.state.sessionPassword) {
      this.state.registerFailure();
      this.validationMessage = 'That password does not match the session password.';
      return;
    }

    this.step = 'loading';
    setTimeout(() => {
      this.state.registerSuccess();
      this.step = 'success';
      this.startAutoAdvance();
    }, 700);
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  retry(): void {
    this.step = 'form';
    this.password = '';
    this.validationMessage = '';
  }

  trackInteraction(): void {
    this.state.registerInteraction();
  }

  private startAutoAdvance(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }

    this.autoAdvanceTimer = setTimeout(() => {
      this.continueTest();
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
