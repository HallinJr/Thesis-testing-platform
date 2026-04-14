import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService, SUSResponse } from '../test-state.service';

type Step = 'form' | 'loading' | 'success' | 'sus';

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

  constructor(private cdr: ChangeDetectorRef, private router: Router, public state: TestStateService) {}
  
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  susResponses: SUSResponse = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 };
  susValidation = '';

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
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
    }
    this.autoAdvanceTimer = setTimeout(() => {
      this.state.registerSuccess();
      this.step = 'sus';
      this.autoAdvanceTimer = null;
      this.cdr.detectChanges();
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

  submitSUS(): void {
    this.susValidation = '';
    const allAnswered = Object.values(this.susResponses).every(v => v > 0);
    
    if (!allAnswered) {
      this.susValidation = 'Please answer all SUS questions to continue.';
      return;
    }

    this.state.saveSUSResponseForCurrentMethod(this.susResponses);
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
