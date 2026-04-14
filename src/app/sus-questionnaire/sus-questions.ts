import { SUSResponse } from '../test-state.service';

export interface SusQuestion {
  key: keyof SUSResponse;
  text: string;
}

export const SUS_QUESTIONS: SusQuestion[] = [
  { key: 'q1', text: 'Jag tror jag skulle vilja använda den här autentiseringsmetoden regelbundet.' },
  { key: 'q2', text: 'Jag upplevde att denna autentiseringsmetod var onädigt komplicerad.' },
  { key: 'q3', text: 'Jag tyckte den här autentiseringsmetoden var lätt att använda.' },
  { key: 'q4', text: 'Jag tror att jag skulle behöva stöd av en tekniskt kunnig person för att kunna använda denna autentiseringsmetoden.' },
  { key: 'q5', text: 'Jag upplevde att denna autentiseringsmetoden var väl sammanhängande.' },
  { key: 'q6', text: 'Jag tyckte att denna autentiseringsmetod innehöll för många inkonsekvenser.' },
  { key: 'q7', text: 'Jag tror att de flesta skulle lära sig att använda denna autentiseringsmetod mycket snabbt.' },
  { key: 'q8', text: 'Jag upplevde denna autentiseringsmetod som besvärlig att använda.' },
  { key: 'q9', text: 'Jag kände mig trygg i att använda denna autentiseringsmetod.' },
  { key: 'q10', text: 'Jag behövde lära mig många saker innan jag kunde använda denna autentiseringsmetod.' }
];
