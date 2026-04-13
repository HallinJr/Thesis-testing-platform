import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthPasswordComponent } from './auth-password/auth-password.component';
import { AuthSmsComponent } from './auth-sms/auth-sms.component';
import { AuthPasskeyComponent } from './auth-passkey/auth-passkey.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'password', component: AuthPasswordComponent },
	{ path: 'sms', component: AuthSmsComponent },
	{ path: 'passkey', component: AuthPasskeyComponent },
	{ path: '**', redirectTo: '' }
];
