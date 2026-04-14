import { Injectable } from '@angular/core';

export type AuthMethodKey = 'password' | 'sms' | 'passkey';

export interface AuthMethod {
  key: AuthMethodKey;
  name: string;
  description: string;
  route: string;
  icon: string;
}

export interface AttemptLog {
  participantId: string;
  methodName: string;
  completionTimeMs: number;
  attempts: number;
  sus?: SUSResponse;
  susScore?: number;
}

export interface SUSResponse {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
}

export interface SessionLog {
  savedAt: string;
  attempts: AttemptLog[];
}

@Injectable({ providedIn: 'root' })
export class TestStateService {
  private readonly ALL_METHODS: AuthMethod[] = [
    { key: 'password', name: 'Enfaktor (Lösenord)', description: 'Ange sessionslösenordet.', route: '/password', icon: '🔑' },
    { key: 'sms', name: 'Tvåfaktor (Lösenord + engångskod)', description: 'Ange lösenord och därefter en engångskod.', route: '/sms', icon: '📱' },
    { key: 'passkey', name: 'Passkey (PIN-kod)', description: 'Ange en lokal 4-siffrig PIN-kod för passkey-simulering.', route: '/passkey', icon: '🔐' }
  ];
  private readonly STORAGE_KEY = 'authStudyLogsV1';

  shuffledMethods: AuthMethod[] = [];
  currentIndex = 0;
  testStarted = false;
  testFinished = false;
  participantId = '';
  sessionId = '';
  sessionPassword = '';
  sessionPasskeyPin = '';

  private firstInteractionAt: number | null = null;
  private failedAttempts = 0;
  private attemptsThisSession: AttemptLog[] = [];
  private sessionStartedAt: string | null = null;

  get allMethods(): AuthMethod[] {
    return this.ALL_METHODS;
  }

  get currentMethod(): AuthMethod {
    return this.shuffledMethods[this.currentIndex];
  }

  get hasActiveMethod(): boolean {
    return this.testStarted && !!this.currentMethod;
  }

  get currentSessionAttempts(): AttemptLog[] {
    return [...this.attemptsThisSession];
  }

  get allStoredSessions(): SessionLog[] {
    return this.readStoredSessions();
  }

  startTest(participantId?: string, sessionPassword?: string, sessionPasskeyPin?: string): void {
    this.participantId = participantId?.trim() || this.createParticipantId();
    this.sessionId = this.createSessionId();
    this.sessionPassword = sessionPassword?.trim() || this.createSessionPassword();
    this.sessionPasskeyPin = this.normalizePin(sessionPasskeyPin) || this.createSessionPasskeyPin();
    this.shuffledMethods = this.shuffleMethods();
    this.currentIndex = 0;
    this.testStarted = true;
    this.testFinished = false;
    this.firstInteractionAt = null;
    this.failedAttempts = 0;
    this.attemptsThisSession = [];
    this.sessionStartedAt = new Date().toISOString();
  }

  beginCurrentMethod(): void {
    this.firstInteractionAt = null;
    this.failedAttempts = 0;
  }

  registerInteraction(): void {
    if (!this.testStarted || this.testFinished) {
      return;
    }

    if (this.firstInteractionAt === null) {
      this.firstInteractionAt = Date.now();
    }
  }

  registerFailure(): void {
    this.registerInteraction();
    this.failedAttempts += 1;
  }

  registerSuccess(): AttemptLog | null {
    if (!this.hasActiveMethod) {
      return null;
    }

    this.registerInteraction();
    const completedAtMs = Date.now();
    const startedAtMs = this.firstInteractionAt ?? completedAtMs;
    const log: AttemptLog = {
      participantId: this.participantId,
      methodName: this.currentMethod.name,
      completionTimeMs: Math.max(0, completedAtMs - startedAtMs),
      attempts: this.failedAttempts + 1
    };

    this.attemptsThisSession.push(log);
    return log;
  }

  saveSUSResponseForCurrentMethod(sus: SUSResponse): void {
    if (this.attemptsThisSession.length > 0) {
      const currentAttempt = this.attemptsThisSession[this.attemptsThisSession.length - 1];
      currentAttempt.sus = sus;
      currentAttempt.susScore = this.calculateSusScore(sus);
    }
  }

  advance(): void {
    if (this.currentIndex < this.shuffledMethods.length - 1) {
      this.currentIndex++;
      this.beginCurrentMethod();
    } else {
      this.persistCurrentSession();
      this.testFinished = true;
      this.testStarted = false;
    }
  }

  reset(): void {
    this.testStarted = false;
    this.testFinished = false;
    this.currentIndex = 0;
    this.shuffledMethods = [];
    this.firstInteractionAt = null;
    this.failedAttempts = 0;
    this.attemptsThisSession = [];
    this.participantId = '';
    this.sessionId = '';
    this.sessionPassword = '';
    this.sessionPasskeyPin = '';
    this.sessionStartedAt = null;
  }

  exportCsv(): string {
    const susHeaders = ['SUS_Q1', 'SUS_Q2', 'SUS_Q3', 'SUS_Q4', 'SUS_Q5', 'SUS_Q6', 'SUS_Q7', 'SUS_Q8', 'SUS_Q9', 'SUS_Q10', 'SUS_Score'];
    const headers = [
      'participantId',
      'methodName',
      'completionTimeMs',
      'attempts',
      ...susHeaders
    ];

    const sessions = this.readStoredSessions();
    const rows = sessions.flatMap((session) =>
      session.attempts.map((attempt) => {
        const susValues = attempt.sus ? [
          attempt.sus.q1,
          attempt.sus.q2,
          attempt.sus.q3,
          attempt.sus.q4,
          attempt.sus.q5,
          attempt.sus.q6,
          attempt.sus.q7,
          attempt.sus.q8,
          attempt.sus.q9,
          attempt.sus.q10,
          attempt.susScore ?? this.calculateSusScore(attempt.sus)
        ] : Array(11).fill('');
        
        return [
          attempt.participantId,
          attempt.methodName,
          attempt.completionTimeMs,
          attempt.attempts,
          ...susValues
        ];
      })
    );

    return [headers, ...rows]
      .map((row) => row.map((value) => this.toCsvCell(String(value))).join(','))
      .join('\n');
  }

  exportJson(): string {
    const sessions = this.readStoredSessions();
    const payload = {
      exportedAt: new Date().toISOString(),
      sessions: sessions.map((session) => ({
        savedAt: session.savedAt,
        attempts: session.attempts
      }))
    };

    return JSON.stringify(payload, null, 2);
  }

  clearStoredData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  private shuffleMethods(): AuthMethod[] {
    const copy = [...this.ALL_METHODS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  private persistCurrentSession(): void {
    if (!this.participantId || this.attemptsThisSession.length === 0) {
      return;
    }

    const sessions = this.readStoredSessions();
    const sessionLog: SessionLog = {
      savedAt: new Date().toISOString(),
      attempts: [...this.attemptsThisSession]
    };
    sessions.push(sessionLog);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  private readStoredSessions(): SessionLog[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as SessionLog[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private createParticipantId(): string {
    return `P-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private createSessionId(): string {
    return `S-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  private createSessionPassword(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  }

  private createSessionPasskeyPin(): string {
    return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  }

  private normalizePin(value?: string): string {
    if (!value) {
      return '';
    }

    const pin = value.replace(/\D/g, '').slice(0, 4);
    return pin.length === 4 ? pin : '';
  }

  private toCsvCell(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private calculateSusScore(sus: SUSResponse): number {
    const oddScore = (sus.q1 - 1) + (sus.q3 - 1) + (sus.q5 - 1) + (sus.q7 - 1) + (sus.q9 - 1);
    const evenScore = (5 - sus.q2) + (5 - sus.q4) + (5 - sus.q6) + (5 - sus.q8) + (5 - sus.q10);
    return Number(((oddScore + evenScore) * 2.5).toFixed(1));
  }
}
