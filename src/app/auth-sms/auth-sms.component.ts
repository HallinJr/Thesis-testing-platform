import { ChangeDetectorRef, Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService, SUSResponse } from '../test-state.service';

type Step = 'password' | 'sms-verify' | 'verifying' | 'success' | 'sus';

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

  constructor(private cdr: ChangeDetectorRef, private router: Router, public state: TestStateService) {}
  otcCode = '';
  step: Step = 'password';
  validationMessage = '';
  displayedOtp = '739241';
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  susResponses: SUSResponse = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 };
  susValidation = '';

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
    setTimeout(() => this.otcInput?.nativeElement?.focus(), 0);
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

  private focusFirstOtpInput(): void {
    setTimeout(() => {
      this.otcInput?.nativeElement.focus();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
