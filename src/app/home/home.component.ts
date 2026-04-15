import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestStateService } from '../test-state.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  participantIdInput = '';
  sessionPasswordInput = '';
  sessionPasskeyPinInput = '';
  sessionPasswordError = '';
  sessionPasskeyPinError = '';
  clearStorageOnStart = false;
  private jsonFileHandle: any | null = null;

  constructor(public state: TestStateService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['advance'] === 'true' && this.state.testStarted) {
        this.state.advance();
      }
    });
  }

  startTest(): void {
    const password = this.sessionPasswordInput.trim();
    const pin = this.sessionPasskeyPinInput.trim();

    this.sessionPasswordError = '';
    this.sessionPasskeyPinError = '';

    if (!this.isSecurePassword(password)) {
      this.sessionPasswordError = 'Lösenordet måste vara minst 8 tecken och innehålla stor och liten bokstav, siffra och specialtecken.';
    }

    if (!/^\d{4}$/.test(pin)) {
      this.sessionPasskeyPinError = 'Passkey-PIN måste vara exakt 4 siffror.';
    }

    if (this.sessionPasswordError || this.sessionPasskeyPinError) {
      return;
    }

    if (this.clearStorageOnStart) {
      this.state.clearStoredData();
    }

    this.state.startTest(this.participantIdInput, password, pin);
    this.state.beginCurrentMethod();
  }

  trackPasswordInput(): void {
    if (!this.sessionPasswordError) {
      return;
    }

    if (this.isSecurePassword(this.sessionPasswordInput.trim())) {
      this.sessionPasswordError = '';
    }
  }

  trackPinInput(): void {
    this.sessionPasskeyPinInput = this.sessionPasskeyPinInput.replace(/\D/g, '').slice(0, 4);
    if (this.sessionPasskeyPinError && /^\d{4}$/.test(this.sessionPasskeyPinInput)) {
      this.sessionPasskeyPinError = '';
    }
  }

  clearStoredDataNow(): void {
    this.state.clearStoredData();
  }

  goToMethod(): void {
    this.router.navigate([this.state.currentMethod.route]);
  }

  downloadCsv(): void {
    const csv = this.state.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auth-study-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async downloadJson(): Promise<void> {
    const json = this.state.exportJson();
    const filePicker = (window as any).showSaveFilePicker;

    if (!filePicker) {
      this.downloadJsonFallback(json);
      return;
    }

    try {
      if (!this.jsonFileHandle) {
        this.jsonFileHandle = await filePicker({
          suggestedName: 'study-data.json',
          types: [
            {
              description: 'JSON-filer',
              accept: { 'application/json': ['.json'] }
            }
          ]
        });
      }

      const writable = await this.jsonFileHandle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }

      this.downloadJsonFallback(json);
    }
  }

  private downloadJsonFallback(json: string): void {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  reset(): void {
    this.participantIdInput = '';
    this.sessionPasswordInput = '';
    this.sessionPasskeyPinInput = '';
    this.sessionPasswordError = '';
    this.sessionPasskeyPinError = '';
    this.state.reset();
  }

  private isSecurePassword(value: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);
  }
}
