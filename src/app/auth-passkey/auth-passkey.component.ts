import { Component, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService } from '../test-state.service';

type Step = 'select' | 'pin' | 'verifying' | 'success';

@Component({
  selector: 'app-auth-passkey',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-passkey.component.html',
  styleUrl: './auth-passkey.component.scss'
})
export class AuthPasskeyComponent implements OnInit, OnDestroy {
  @ViewChild('pinInput') pinInput?: ElementRef<HTMLInputElement>;

  pinCode = '';
  step: Step = 'select';
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  validationMessage = '';

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Method ${this.state.currentIndex + 1} of ${this.state.shuffledMethods.length}`;
  }

  ngOnInit(): void {
    if (!this.state.hasActiveMethod || this.state.currentMethod.key !== 'passkey') {
      this.router.navigate(['/']);
      return;
    }

    this.state.beginCurrentMethod();
  }

  startPasskey(): void {
    this.state.registerInteraction();
    this.validationMessage = '';
    this.pinCode = '';
    this.step = 'pin';
    this.focusFirstPinInput();
  }

  onPinInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onPinChange(input.value);
  }

  onPinChange(value: string): void {
    const val = value.replace(/\D/g, '').slice(0, 4);
    this.state.registerInteraction();
    this.pinCode = val;
  }

  get pinComplete(): boolean {
    return this.pinCode.length === 4;
  }

  get enteredPin(): string {
    return this.pinCode;
  }

  submitPin(): void {
    this.state.registerInteraction();
    this.validationMessage = '';

    if (!this.pinComplete) {
      this.state.registerFailure();
      this.validationMessage = 'Enter all 4 PIN digits to continue.';
      return;
    }

    if (this.enteredPin !== this.state.sessionPasskeyPin) {
      this.state.registerFailure();
      this.validationMessage = 'That PIN does not match the passkey PIN from session setup.';
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

  private focusFirstPinInput(): void {
    setTimeout(() => {
      this.pinInput?.nativeElement.focus();
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
