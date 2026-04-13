import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService } from '../test-state.service';

type Step = 'password' | 'sms-verify' | 'verifying' | 'success';

@Component({
  selector: 'app-auth-sms',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-sms.component.html',
  styleUrl: './auth-sms.component.scss'
})
export class AuthSmsComponent implements OnInit, OnDestroy {
  @ViewChild('otcInput') otcInput?: ElementRef<HTMLInputElement>;

  password = '';
  showPassword = false;
  otcCode = '';
  step: Step = 'password';
  validationMessage = '';
  displayedOtp = '739241';
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Method ${this.state.currentIndex + 1} of ${this.state.shuffledMethods.length}`;
  }

  ngOnInit(): void {
    if (!this.state.hasActiveMethod || this.state.currentMethod.key !== 'sms') {
      this.router.navigate(['/']);
      return;
    }

    this.state.beginCurrentMethod();
  }

  submitPassword(): void {
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

    this.step = 'sms-verify';
    this.focusFirstOtpInput();
  }

  onOtcInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(0, 6);
    this.state.registerInteraction();
    this.otcCode = val;
    input.value = val;
  }

  get smsComplete(): boolean {
    return this.otcCode.length === 6;
  }

  submitSms(): void {
    this.state.registerInteraction();
    this.validationMessage = '';

    if (!this.smsComplete) {
      this.state.registerFailure();
      this.validationMessage = 'Enter the 6-digit OTC code to continue.';
      return;
    }

    this.step = 'verifying';
    setTimeout(() => {
      this.state.registerSuccess();
      this.step = 'success';
      this.startAutoAdvance();
    }, 700);
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  private focusFirstOtpInput(): void {
    setTimeout(() => {
      this.otcInput?.nativeElement.focus();
    }, 0);
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
