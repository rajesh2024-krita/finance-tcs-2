import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService, CreateUserDto, SocietyDropdownDto } from '../../../../services/user.service';
import { AuthService, User, UserRole } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, takeUntil, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="content-header">
        <div class="breadcrumb">
          <span>File</span>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span>Security</span>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-active">New User</span>
        </div>
        <h1 class="text-page-title">Create New User</h1>
        <p class="text-body text-gray-600 dark:text-gray-400">
          Add new users to the system with appropriate roles and permissions
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p class="text-center mt-4">Loading societies...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="card mb-6 border-l-4 border-l-red-400">
        <div class="card-content">
          <div class="flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            <div>
              <h4 class="text-section-header text-red-700">Error</h4>
              <p class="text-body text-red-600">{{ error }}</p>
            </div>
          </div>
          <button (click)="loadSocieties()" class="btn btn-primary mt-4">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      </div>

      <!-- Access Denied -->
      <div *ngIf="!hasAccess" class="card mb-6 border-l-4 border-l-yellow-400">
        <div class="card-content">
          <div class="flex items-center gap-3">
            <mat-icon class="text-yellow-500">security</mat-icon>
            <div>
              <h4 class="text-section-header text-yellow-700">Access Denied</h4>
              <p class="text-body text-yellow-600">
                You don't have permission to create new users. Only Super Admins and Society Admins can create users.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- User Creation Form -->
      <div *ngIf="hasAccess && !loading">
        <form [formGroup]="userForm" class="form-container">
          
          <!-- Basic Information Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>person</mat-icon>
              <span>Basic Information</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-2">
                <div class="form-field">
                  <label class="form-label form-label-required">Username</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="username"
                    placeholder="Enter unique username"
                    autocomplete="username">
                  <div *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched" 
                       class="form-error">
                    <span *ngIf="userForm.get('username')?.errors?.['required']">Username is required</span>
                    <span *ngIf="userForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</span>
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Password</label>
                  <input 
                    type="password" 
                    class="form-input"
                    formControlName="password"
                    placeholder="Enter secure password"
                    autocomplete="new-password">
                  <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" 
                       class="form-error">
                    <span *ngIf="userForm.get('password')?.errors?.['required']">Password is required</span>
                    <span *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-label form-label-required">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-input"
                    formControlName="confirmPassword"
                    placeholder="Confirm password"
                    autocomplete="new-password">
                  <div *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" 
                       class="form-error">
                    <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">Please confirm password</span>
                    <span *ngIf="userForm.get('confirmPassword')?.errors?.['mismatch']">Passwords do not match</span>
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-label form-label-required">User Role</label>
                  <select class="form-select" formControlName="role">
                    <option value="">Select Role</option>
                    <option *ngFor="let role of availableRoles" [value]="role.value">{{ role.label }}</option>
                  </select>
                  <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" 
                       class="form-error">
                    Role is required
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>person_outline</mat-icon>
              <span>Personal Information</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-2">
                <div class="form-field">
                  <label class="form-label form-label-required">First Name</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="firstName"
                    placeholder="Enter first name">
                  <div *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched" 
                       class="form-error">
                    First name is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Last Name</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="lastName"
                    placeholder="Enter last name">
                  <div *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched" 
                       class="form-error">
                    Last name is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Email Address</label>
                  <input 
                    type="email" 
                    class="form-input"
                    formControlName="email"
                    placeholder="user@example.com">
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
                       class="form-error">
                    <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    class="form-input"
                    formControlName="phone"
                    placeholder="+91 9876543210">
                </div>
              </div>
            </div>
          </div>

          <!-- Society Assignment Section (Super Admin Only) -->
          <div *ngIf="isSuperAdmin" class="form-section">
            <div class="form-section-header">
              <mat-icon>business</mat-icon>
              <span>Society Assignment</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-1">
                <div class="form-field">
                  <label class="form-label form-label-required">Society</label>
                  <select class="form-select" formControlName="societyId">
                    <option value="">Select Society</option>
                    <option *ngFor="let society of societies" [value]="society.id">
                      {{ society.societyName }} ({{ society.registrationNumber }})
                    </option>
                  </select>
                  <div *ngIf="userForm.get('societyId')?.invalid && userForm.get('societyId')?.touched" 
                       class="form-error">
                    Society selection is required for Super Admin
                  </div>
                  <div class="form-help">
                    Select the society this user will be associated with
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Society Info (Society Admin) -->
          <div *ngIf="!isSuperAdmin && currentUser?.societyName" class="form-section">
            <div class="form-section-header">
              <mat-icon>info</mat-icon>
              <span>Society Information</span>
            </div>
            <div class="form-section-content">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-blue-600">business</mat-icon>
                  <div>
                    <h4 class="font-medium text-blue-800">{{ currentUser?.societyName }}</h4>
                    <p class="text-sm text-blue-600">User will be created under this society</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Role Permissions Info -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>security</mat-icon>
              <span>Role Permissions</span>
            </div>
            <div class="form-section-content">
              <div class="role-permissions-grid">
                <div class="permission-card" 
                     [class.active]="selectedRoleInfo?.value === 'super_admin'"
                     *ngIf="isSuperAdmin">
                  <div class="permission-header">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <h4>Super Admin</h4>
                  </div>
                  <ul class="permission-list">
                    <li>Full system access</li>
                    <li>Manage all societies</li>
                    <li>Create/edit users across societies</li>
                    <li>System-wide configuration</li>
                  </ul>
                </div>

                <div class="permission-card" 
                     [class.active]="selectedRoleInfo?.value === 'society_admin'">
                  <div class="permission-header">
                    <mat-icon>supervisor_account</mat-icon>
                    <h4>Society Admin</h4>
                  </div>
                  <ul class="permission-list">
                    <li>Manage society information</li>
                    <li>Create/edit society users</li>
                    <li>Approve society changes</li>
                    <li>View all society reports</li>
                  </ul>
                </div>

                <!-- <div class="permission-card" 
                     [class.active]="selectedRoleInfo?.value === 'user'">
                  <div class="permission-header">
                    <mat-icon>person</mat-icon>
                    <h4>Regular User</h4>
                  </div>
                  <ul class="permission-list">
                    <li>View assigned modules</li>
                    <li>Process transactions</li>
                    <li>Generate reports</li>
                    <li>Basic member management</li>
                  </ul>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="card-actions">
            <div class="flex justify-end gap-3">
              <button 
                type="button"
                (click)="resetForm()"
                [disabled]="submitting"
                class="btn btn-secondary">
                <mat-icon>refresh</mat-icon>
                Reset Form
              </button>
              <button 
                type="button"
                (click)="createUser()"
                [disabled]="userForm.invalid || submitting"
                class="btn btn-success">
                <mat-icon>person_add</mat-icon>
                {{ submitting ? 'Creating User...' : 'Create User' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .content-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-primary);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .breadcrumb-separator {
      font-size: 1rem;
      color: var(--color-text-light);
    }

    .breadcrumb-active {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }

    .border-l-4 {
      border-left-width: 4px;
    }

    .border-l-red-400 {
      border-left-color: #f87171;
    }

    .border-l-yellow-400 {
      border-left-color: #facc15;
    }

    .text-center { text-align: center; }
    .mt-4 { margin-top: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }

    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-end { justify-content: flex-end; }
    .gap-3 { gap: 0.75rem; }

    .text-red-500 { color: #ef4444; }
    .text-red-600 { color: #dc2626; }
    .text-red-700 { color: #b91c1c; }
    .text-yellow-500 { color: #eab308; }
    .text-yellow-600 { color: #ca8a04; }
    .text-yellow-700 { color: #a16207; }
    .text-blue-600 { color: #2563eb; }
    .text-blue-800 { color: #1e40af; }

    .bg-blue-50 { background-color: #eff6ff; }
    .border-blue-200 { border-color: #bfdbfe; }
    .rounded-lg { border-radius: 0.5rem; }
    .p-4 { padding: 1rem; }
    .font-medium { font-weight: 500; }
    .text-sm { font-size: 0.875rem; }

    .form-error {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-help {
      color: var(--color-text-muted);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .role-permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .permission-card {
      border: 2px solid var(--color-border-secondary);
      border-radius: 0.5rem;
      padding: 1rem;
      transition: all 0.2s ease;
    }

    .permission-card.active {
      border-color: var(--color-primary);
      background-color: var(--color-primary-light);
    }

    .permission-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .permission-header h4 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-text-primary);
    }

    .permission-header mat-icon {
      color: var(--color-primary);
    }

    .permission-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .permission-list li {
      padding: 0.25rem 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      position: relative;
      padding-left: 1rem;
    }

    .permission-list li:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--color-success);
      font-weight: bold;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .border {
      border-width: 1px;
    }
  `]
})
export class NewUserComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;

  currentUser: User | null = null;
  societies: SocietyDropdownDto[] = [];

  private destroy$ = new Subject<void>();

  availableRoles = [
    { value: UserRole.MEMBER, label: 'Regular User' },
    { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        if (user) {
          this.setupRoleOptions();
          if (this.hasAccess && this.isSuperAdmin) {
            this.loadSocieties();
          }
        } else {
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasAccess(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN || this.currentUser?.role === UserRole.SOCIETY_ADMIN;
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN;
  }

  get selectedRoleInfo() {
    const roleValue = this.userForm.get('role')?.value;
    return this.availableRoles.find(role => role.value === roleValue);
  }

  setupRoleOptions() {
    if (this.isSuperAdmin) {
      this.availableRoles = [
        { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
        { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' },
        { value: UserRole.MEMBER, label: 'Regular User' }
      ];
      // Add society ID as required for Super Admin
      this.userForm.get('societyId')?.setValidators([Validators.required]);
    } else {
      this.availableRoles = [
        { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' },
        { value: UserRole.MEMBER, label: 'Regular User' }
      ];
    }
    this.userForm.get('societyId')?.updateValueAndValidity();
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', [Validators.required]],
      societyId: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const confirmPasswordControl = form.get('confirmPassword');
      if (confirmPasswordControl?.errors?.['mismatch']) {
        delete confirmPasswordControl.errors['mismatch'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }
    return null;
  }

  loadSocieties() {
    this.loading = true;
    this.error = null;

    this.userService.getSocietiesForDropdown()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading societies:', err);
          this.error = err.error?.message || 'Failed to load societies';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((societies: SocietyDropdownDto[]) => {
        this.societies = societies;
      });
  }

  createUser() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.submitting = true;

    const formValue = this.userForm.value;
    const createUserDto: CreateUserDto = {
      username: formValue.username,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone || '',
      role: formValue.role,
      societyId: this.isSuperAdmin ? formValue.societyId : this.currentUser?.societyId
    };

    this.userService.createUser(createUserDto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: (user: any) => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Error creating user:', err);
          this.snackBar.open(
            err.error?.message || 'Error creating user',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  resetForm() {
    this.userForm.reset();
    this.userForm.markAsUntouched();
    this.userForm.markAsPristine();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}