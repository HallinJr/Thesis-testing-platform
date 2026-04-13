import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPasskeyComponent } from './auth-passkey.component';

describe('AuthPasskeyComponent', () => {
  let component: AuthPasskeyComponent;
  let fixture: ComponentFixture<AuthPasskeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPasskeyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthPasskeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
