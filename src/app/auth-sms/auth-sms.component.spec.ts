import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSmsComponent } from './auth-sms.component';

describe('AuthSmsComponent', () => {
  let component: AuthSmsComponent;
  let fixture: ComponentFixture<AuthSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
