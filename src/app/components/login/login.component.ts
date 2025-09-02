import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800">
      <div class="absolute inset-0 bg-black opacity-20"></div>
      
      <div class="relative z-10 w-full max-w-md">
        <mat-card class="p-8 backdrop-blur-sm bg-white/10 border border-white/20 shadow-2xl">
          <mat-card-header class="text-center mb-8">
            <div class="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <mat-icon class="text-white text-3xl">account_balance</mat-icon>
            </div>
            <mat-card-title class="text-2xl font-bold text-white">
              Society Management System
            </mat-card-title>
            <mat-card-subtitle class="text-white/80 mt-2">
              Please sign in to your account
            </mat-card-subtitle>
          </mat-card-header>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username</mat-label>
              <input matInput 
                     name="username" 
                     [(ngModel)]="credentials.username" 
                     required 
                     autocomplete="username"
                     [disabled]="isLoading">
              <mat-icon matPrefix class="text-white/60 mr-2">person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput 
                     name="password" 
                     type="password" 
                     [(ngModel)]="credentials.password" 
                     required 
                     autocomplete="current-password"
                     [disabled]="isLoading">
              <mat-icon matPrefix class="text-white/60 mr-2">lock</mat-icon>
            </mat-form-field>

            <div *ngIf="errorMessage" class="text-red-300 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/30">
              {{errorMessage}}
            </div>

            <button mat-raised-button 
                    type="submit" 
                    class="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg"
                    [disabled]="!loginForm.valid || isLoading">
              <span *ngIf="!isLoading">Sign In</span>
              <mat-spinner *ngIf="isLoading" diameter="24" class="mx-auto"></mat-spinner>
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-white/60 text-sm">
              Super Admin: admin / admin
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field {
      --mdc-theme-primary: #6366f1;
      --mdc-theme-on-surface: rgba(255, 255, 255, 0.87);
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    
    ::ng-deep .mat-mdc-form-field-infix {
      color: white;
    }
    
    ::ng-deep .mat-mdc-floating-label {
      color: rgba(255, 255, 255, 0.7);
    }
    
    ::ng-deep .mat-mdc-form-field-required-marker {
      color: rgba(255, 255, 255, 0.7);
    }
    
    ::ng-deep .mdc-line-ripple::before,
    ::ng-deep .mdc-line-ripple::after {
      border-bottom-color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.username, this.credentials.password)
      .subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Invalid username or password';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
  }
}