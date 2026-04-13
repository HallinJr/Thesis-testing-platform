import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService } from '../test-state.service';

type Step = 'password' | 'sms-sending' | 'sms-verify' | 'verifying' | 'success';

interface Digit { index: number; value: string; }

@Component({
  selector: 'app-auth-sms',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-sms.component.html',
  styleUrl: './auth-sms.component.scss'
})
export class AuthSmsComponent {
  @ViewChildren('smsInput') smsInputs!: QueryList<ElementRef<HTMLInputElement>>;

  username = '';
  password = '';
  showPassword = false;
  smsDigits: Digit[] = Array.from({ length: 6 }, (_, i) => ({ index: i, value: '' }));
  step: Step = 'password';

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Steg ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
  }

  submitPassword(): void {
    if (!this.username || !this.password) return;
    this.step = 'sms-sending';
    setTimeout(() => { this.step = 'sms-verify'; }, 1800);
  }

  onSmsInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.smsDigits[index].value = val;
    input.value = val;
    if (val && index < 5) {
      const next = this.smsInputs.toArray()[index + 1];
      next?.nativeElement.focus();
    }
  }

  onSmsKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.smsDigits[index].value && index > 0) {
      const prev = this.smsInputs.toArray()[index - 1];
      prev?.nativeElement.focus();
    }
  }

  get smsComplete(): boolean {
    return this.smsDigits.every(d => d.value.length === 1);
  }

  submitSms(): void {
    if (!this.smsComplete) return;
    this.step = 'verifying';
    setTimeout(() => { this.step = 'success'; }, 1500);
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }
}
