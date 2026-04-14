import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SUSResponse } from '../test-state.service';
import { SUS_QUESTIONS } from './sus-questions';

@Component({
  selector: 'app-sus-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sus-questionnaire.component.html',
  styleUrl: './sus-questionnaire.component.scss'
})
export class SusQuestionnaireComponent {
  @Output() submitted = new EventEmitter<SUSResponse>();

  susResponses: SUSResponse = {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0
  };
  validationMessage = '';

  readonly scaleValues = [1, 2, 3, 4, 5];
  readonly questions = SUS_QUESTIONS;

  submit(): void {
    this.validationMessage = '';
    const allAnswered = Object.values(this.susResponses).every((value) => value > 0);

    if (!allAnswered) {
      this.validationMessage = 'Besvara alla SUS-frågor för att fortsätta.';
      return;
    }

    this.submitted.emit({ ...this.susResponses });
  }
}
