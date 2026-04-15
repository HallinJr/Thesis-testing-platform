import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService, SUSResponse } from '../test-state.service';
import { SusQuestionnaireComponent } from '../sus-questionnaire/sus-questionnaire.component';

type Step = 'select' | 'pin' | 'verifying' | 'success' | 'sus';

@Component({
  selector: 'app-auth-passkey',
  standalone: true,
  imports: [FormsModule, CommonModule, SusQuestionnaireComponent],
  templateUrl: './auth-passkey.component.html',
  styleUrl: './auth-passkey.component.scss'
})
export class AuthPasskeyComponent implements OnInit, OnDestroy {
  @ViewChild('pinInput') pinInput?: ElementRef<HTMLInputElement>;

  pinCode = '';
  step: Step = 'select';

  constructor(private cdr: ChangeDetectorRef, private router: Router, public state: TestStateService) {}
  
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  validationMessage = '';

  get stepLabel(): string {
    return `Metod ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
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
      this.validationMessage = 'Ange alla 4 PIN-siffror för att fortsätta.';
      return;
    }

    if (this.enteredPin !== this.state.sessionPasskeyPin) {
      this.state.registerFailure();
      this.validationMessage = 'PIN-koden stämmer inte med passkey-PIN från sessionsinställningarna.';
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

  cancelPinEntry(): void {
    this.state.registerInteraction();
    this.validationMessage = '';
    this.pinCode = '';
    this.step = 'select';
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  submitSUS(sus: SUSResponse): void {
    this.state.saveSUSResponseForCurrentMethod(sus);
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  private focusFirstPinInput(): void {
    setTimeout(() => {
      this.pinInput?.nativeElement.focus();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
