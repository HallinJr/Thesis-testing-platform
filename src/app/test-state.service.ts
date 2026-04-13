import { Injectable } from '@angular/core';

interface AuthMethod {
  name: string;
  description: string;
  route: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class TestStateService {
  private readonly ALL_METHODS: AuthMethod[] = [
    { name: 'Lösenord', description: 'Traditionell inloggning med användarnamn och lösenord.', route: '/password', icon: '🔑' },
    { name: 'Lösenord + SMS', description: 'Tvåfaktorsautentisering med lösenord och SMS-kod.', route: '/sms', icon: '📱' },
    { name: 'Passkey + PIN', description: 'Lösenordsfri inloggning med passkey och lokal PIN-kod.', route: '/passkey', icon: '🔐' }
  ];

  shuffledMethods: AuthMethod[] = [];
  currentIndex = 0;
  testStarted = false;
  testFinished = false;

  get allMethods(): AuthMethod[] {
    return this.ALL_METHODS;
  }

  startTest(): void {
    this.shuffledMethods = [...this.ALL_METHODS].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.testStarted = true;
    this.testFinished = false;
  }

  get currentMethod(): AuthMethod {
    return this.shuffledMethods[this.currentIndex];
  }

  advance(): void {
    if (this.currentIndex < this.shuffledMethods.length - 1) {
      this.currentIndex++;
    } else {
      this.testFinished = true;
      this.testStarted = false;
    }
  }

  reset(): void {
    this.testStarted = false;
    this.testFinished = false;
    this.currentIndex = 0;
    this.shuffledMethods = [];
  }
}
