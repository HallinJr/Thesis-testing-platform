import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService } from '../test-state.service';

type Step = 'select' | 'scanning' | 'pin' | 'verifying' | 'success';

interface Digit { index: number; value: string; }

@Component({
  selector: 'app-auth-passkey',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-passkey.component.html',
  styleUrl: './auth-passkey.component.scss'
})
export class AuthPasskeyComponent {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef<HTMLInputElement>>;

  pinDigits: Digit[] = Array.from({ length: 4 }, (_, i) => ({ index: i, value: '' }));
  step: Step = 'select';
  scanProgress = 0;
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Steg ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
  }

  startPasskey(): void {
    this.step = 'scanning';
    this.scanProgress = 0;
    this.scanTimer = setInterval(() => {
      this.scanProgress += 5;
      if (this.scanProgress >= 100) {
        if (this.scanTimer) clearInterval(this.scanTimer);
        this.step = 'pin';
      }
    }, 80);
  }

  onPinInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.pinDigits[index].value = val;
    input.value = val;
    if (val && index < 3) {
      const next = this.pinInputs.toArray()[index + 1];
      next?.nativeElement.focus();
    }
  }

  onPinKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.pinDigits[index].value && index > 0) {
      const prev = this.pinInputs.toArray()[index - 1];
      prev?.nativeElement.focus();
    }
  }

  get pinComplete(): boolean {
    return this.pinDigits.every(d => d.value.length === 1);
  }

  submitPin(): void {
    if (!this.pinComplete) return;
    this.step = 'verifying';
    setTimeout(() => { this.step = 'success'; }, 1500);
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }
}
