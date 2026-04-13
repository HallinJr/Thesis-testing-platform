import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestStateService } from '../test-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(public state: TestStateService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['advance'] === 'true' && this.state.testStarted) {
        this.state.advance();
      }
    });
  }

  startTest(): void {
    this.state.startTest();
  }

  goToMethod(): void {
    this.router.navigate([this.state.currentMethod.route]);
  }

  reset(): void {
    this.state.reset();
  }
}
