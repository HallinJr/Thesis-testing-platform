import { SUSResponse } from '../test-state.service';

export interface SusQuestion {
  key: keyof SUSResponse;
  text: string;
}

export const SUS_QUESTIONS: SusQuestion[] = [
  { key: 'q1', text: 'Jag skulle i hög grad kunna tänka mig att använda den här autentiseringsmetoden regelbundet.' },
  { key: 'q2', text: 'Jag upplevde att den här autentiseringsmetoden var onödigt komplicerad.' },
  { key: 'q3', text: 'Jag upplevde att den här autentiseringsmetoden var relativt lätt att använda.' },
  { key: 'q4', text: 'Jag skulle behöva betydande stöd av en tekniskt kunnig person för att använda den här autentiseringsmetoden.' },
  { key: 'q5', text: 'Jag upplevde att de olika delarna i autentiseringsmetoden hängde väl ihop.' },
  { key: 'q6', text: 'Jag upplevde tydliga inkonsekvenser i den här autentiseringsmetoden.' },
  { key: 'q7', text: 'Jag tror att de flesta relativt snabbt skulle lära sig att använda den här autentiseringsmetoden.' },
  { key: 'q8', text: 'Jag upplevde den här autentiseringsmetoden som ganska besvärlig att använda.' },
  { key: 'q9', text: 'Jag kände mig trygg i att använda den här autentiseringsmetoden.' },
  { key: 'q10', text: 'Jag behövde lära mig mycket innan jag kunde börja använda den här autentiseringsmetoden.' }
];
