import { ChangeDetectorRef, Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService, SUSResponse } from '../test-state.service';
import { SusQuestionnaireComponent } from '../sus-questionnaire/sus-questionnaire.component';

type Step = 'password' | 'sms-verify' | 'verifying' | 'success' | 'sus';

@Component({
  selector: 'app-auth-sms',
  standalone: true,
  imports: [FormsModule, CommonModule, SusQuestionnaireComponent],
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
  displayedOtp = '';
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  get stepLabel(): string {
    return `Metod ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
  }

  ngOnInit(): void {
    if (!this.state.hasActiveMethod || this.state.currentMethod.key !== 'sms') {
      this.router.navigate(['/']);
      return;
    }

    this.state.beginCurrentMethod();
    this.displayedOtp = this.generateOtp();
  }

  submitPassword(): void {
    this.state.registerInteraction();
    this.validationMessage = '';

    if (this.password.trim().length < 1) {
      this.state.registerFailure();
      this.validationMessage = 'Ange sessionslösenordet för att fortsätta.';
      return;
    }

    if (this.password !== this.state.sessionPassword) {
      this.state.registerFailure();
      this.validationMessage = 'Lösenordet stämmer inte med sessionslösenordet.';
      return;
    }

    this.otcCode = '';
    this.displayedOtp = this.generateOtp();
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
      this.validationMessage = 'Ange den 6-siffriga engångskoden för att fortsätta.';
      return;
    }

    if (this.otcCode !== this.displayedOtp) {
      this.state.registerFailure();
      this.validationMessage = 'Engångskoden är felaktig. Försök igen.';
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

  submitSUS(sus: SUSResponse): void {
    this.state.saveSUSResponseForCurrentMethod(sus);
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

  private generateOtp(): string {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  }
}
