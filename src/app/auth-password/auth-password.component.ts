import { Component } from '@angular/core';
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
export class AuthPasswordComponent {
  username = '';
  password = '';
  step: Step = 'form';
  showPassword = false;

  constructor(private router: Router, public state: TestStateService) {}

  get stepLabel(): string {
    return `Steg ${this.state.currentIndex + 1} av ${this.state.shuffledMethods.length}`;
  }

  login(): void {
    if (!this.username || !this.password) return;
    this.step = 'loading';
    setTimeout(() => { this.step = 'success'; }, 1500);
  }

  continueTest(): void {
    this.router.navigate(['/'], { queryParams: { advance: 'true' } });
  }

  retry(): void {
    this.step = 'form';
    this.password = '';
  }
}
