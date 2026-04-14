import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestStateService, SUSResponse } from '../test-state.service';
import { SusQuestionnaireComponent } from '../sus-questionnaire/sus-questionnaire.component';

type Step = 'form' | 'loading' | 'success' | 'sus';

@Component({
  selector: 'app-auth-password',
  standalone: true,
  imports: [FormsModule, CommonModule, SusQuestionnaireComponent],
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

  get stepLabel(): string {
    return `Metod ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
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
      this.validationMessage = 'Ange sessionslösenordet för att fortsätta.';
      return;
    }

    if (this.password !== this.state.sessionPassword) {
      this.state.registerFailure();
      this.validationMessage = 'Lösenordet stämmer inte med sessionslösenordet.';
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

  submitSUS(sus: SUSResponse): void {
    this.state.saveSUSResponseForCurrentMethod(sus);
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
