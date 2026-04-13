import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestStateService } from '../test-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  participantIdInput = '';
  sessionPasswordInput = '';
  sessionPasskeyPinInput = '';
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
    this.state.startTest(this.participantIdInput, this.sessionPasswordInput, this.sessionPasskeyPinInput);
    this.state.beginCurrentMethod();
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
              description: 'JSON Files',
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
    this.state.reset();
  }
}
