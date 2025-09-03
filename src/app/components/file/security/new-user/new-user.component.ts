// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { UserService, CreateUserDto } from '../../../../services/user.service';
// import { AuthService, User, UserRole } from '../../../../services/auth.service';
// import { Router } from '@angular/router';
// import { takeUntil, finalize } from 'rxjs/operators';
// import { Subject } from 'rxjs';

// @Component({
//   selector: 'app-new-user',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatButtonModule,
//     MatIconModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatDividerModule,
//     MatProgressBarModule,
//     MatSnackBarModule,
//     MatCheckboxModule
//   ],
//   template: `
//     <div class="animate-fade-in">
//       <!-- Page Header -->
//       <div class="content-header">
//         <div class="breadcrumb">
//           <span>File</span>
//           <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
//           <span>Security</span>
//           <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
//           <span class="breadcrumb-active">New User</span>
//         </div>
//         <h1 class="text-page-title">Create New User</h1>
//         <p class="text-body text-gray-600 dark:text-gray-400">
//           Add new users to the system with appropriate roles and permissions
//         </p>
//       </div>

//       <!-- Access Denied -->
//       <div *ngIf="!hasAccess" class="card mb-6 border-l-4 border-l-yellow-400">
//         <div class="card-content">
//           <div class="flex items-center gap-3">
//             <mat-icon class="text-yellow-500">security</mat-icon>
//             <div>
//               <h4 class="text-section-header text-yellow-700">Access Denied</h4>
//               <p class="text-body text-yellow-600">
//                 You don't have permission to create new users. Only Super Admins and Society Admins can create users.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- User Creation Form -->
//       <div *ngIf="hasAccess">
//         <form [formGroup]="userForm" class="form-container">

//           <!-- Basic Information Section -->
//           <div class="form-section">
//             <div class="form-section-header">
//               <mat-icon>person</mat-icon>
//               <span>Basic Information</span>
//             </div>
//             <div class="form-section-content">
//               <div class="form-grid form-grid-2">
//                 <div class="form-field">
//                   <label class="form-label form-label-required">Username</label>
//                   <input 
//                     type="text" 
//                     class="form-input"
//                     formControlName="username"
//                     placeholder="Enter unique username"
//                     autocomplete="username">
//                   <div *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched" 
//                        class="form-error">
//                     <span *ngIf="userForm.get('username')?.errors?.['required']">Username is required</span>
//                     <span *ngIf="userForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</span>
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label form-label-required">Password</label>
//                   <input 
//                     type="password" 
//                     class="form-input"
//                     formControlName="password"
//                     placeholder="Enter secure password"
//                     autocomplete="new-password">
//                   <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" 
//                        class="form-error">
//                     <span *ngIf="userForm.get('password')?.errors?.['required']">Password is required</span>
//                     <span *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label form-label-required">Confirm Password</label>
//                   <input 
//                     type="password" 
//                     class="form-input"
//                     formControlName="confirmPassword"
//                     placeholder="Confirm password"
//                     autocomplete="new-password">
//                   <div *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" 
//                        class="form-error">
//                     <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">Please confirm password</span>
//                     <span *ngIf="userForm.get('confirmPassword')?.errors?.['mismatch']">Passwords do not match</span>
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label form-label-required">User Role</label>
//                   <select class="form-select" formControlName="role">
//                     <option value="">Select Role</option>
//                     <option *ngFor="let role of availableRoles" [value]="role.value">{{ role.label }}</option>
//                   </select>
//                   <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" 
//                        class="form-error">
//                     Role is required
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Personal Information Section -->
//           <div class="form-section">
//             <div class="form-section-header">
//               <mat-icon>person_outline</mat-icon>
//               <span>Personal Information</span>
//             </div>
//             <div class="form-section-content">
//               <div class="form-grid form-grid-2">
//                 <div class="form-field">
//                   <label class="form-label form-label-required">First Name</label>
//                   <input 
//                     type="text" 
//                     class="form-input"
//                     formControlName="firstName"
//                     placeholder="Enter first name">
//                   <div *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched" 
//                        class="form-error">
//                     First name is required
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label form-label-required">Last Name</label>
//                   <input 
//                     type="text" 
//                     class="form-input"
//                     formControlName="lastName"
//                     placeholder="Enter last name">
//                   <div *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched" 
//                        class="form-error">
//                     Last name is required
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label form-label-required">Email Address</label>
//                   <input 
//                     type="email" 
//                     class="form-input"
//                     formControlName="email"
//                     placeholder="user@example.com">
//                   <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
//                        class="form-error">
//                     <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
//                     <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email</span>
//                   </div>
//                 </div>

//                 <div class="form-field">
//                   <label class="form-label">Phone Number</label>
//                   <input 
//                     type="tel" 
//                     class="form-input"
//                     formControlName="phone"
//                     placeholder="+91 9876543210">
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Current Society Info (Society Admin Only) -->
//           <div *ngIf="!isSuperAdmin && currentUser?.societyName" class="form-section">
//             <div class="form-section-header">
//               <mat-icon>info</mat-icon>
//               <span>Society Information</span>
//             </div>
//             <div class="form-section-content">
//               <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div class="flex items-center gap-3">
//                   <mat-icon class="text-blue-600">business</mat-icon>
//                   <div>
//                     <h4 class="font-medium text-blue-800">{{ currentUser?.societyName }}</h4>
//                     <p class="text-sm text-blue-600">User will be created under this society</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Role Permissions Info -->
//           <div class="form-section">
//             <div class="form-section-header">
//               <mat-icon>security</mat-icon>
//               <span>Role Permissions</span>
//             </div>
//             <div class="form-section-content">
//               <div class="role-permissions-grid">
//                 <div class="permission-card" 
//                      [class.active]="selectedRoleInfo?.value === 'society_admin'">
//                   <div class="permission-header">
//                     <mat-icon>supervisor_account</mat-icon>
//                     <h4>Society Admin</h4>
//                   </div>
//                   <ul class="permission-list">
//                     <li>Manage society information</li>
//                     <li>Create/edit society users</li>
//                     <li>Approve society changes</li>
//                     <li>View all society reports</li>
//                   </ul>
//                 </div>

//                 <div class="permission-card" 
//                      [class.active]="selectedRoleInfo?.value === 'user'">
//                   <div class="permission-header">
//                     <mat-icon>person</mat-icon>
//                     <h4>Regular User</h4>
//                   </div>
//                   <ul class="permission-list">
//                     <li>View assigned modules</li>
//                     <li>Process transactions</li>
//                     <li>Generate reports</li>
//                     <li>Basic member management</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Form Actions -->
//           <div class="card-actions">
//             <div class="flex justify-end gap-3">
//               <button 
//                 type="button"
//                 (click)="resetForm()"
//                 [disabled]="submitting"
//                 class="btn btn-secondary">
//                 <mat-icon>refresh</mat-icon>
//                 Reset Form
//               </button>
//               <button 
//                 type="button"
//                 (click)="createUser()"
//                 [disabled]="userForm.invalid || submitting"
//                 class="btn btn-success">
//                 <mat-icon>person_add</mat-icon>
//                 {{ submitting ? 'Creating User...' : 'Create User' }}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   `,
//   styles: [`
//     /* keep same styles as before */
//   `]
// })
// export class NewUserComponent implements OnInit, OnDestroy {
//   userForm: FormGroup;
//   submitting = false;

//   currentUser: User | null = null;

//   private destroy$ = new Subject<void>();

//   availableRoles = [
//     { value: UserRole.MEMBER, label: 'Regular User' },
//     { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private snackBar: MatSnackBar,
//     private userService: UserService,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     this.userForm = this.createForm();
//   }

//   ngOnInit() {
//     this.authService.currentUser$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((user: User | null) => {
//         this.currentUser = user;
//         if (user) {
//           this.setupRoleOptions();
//         } else {
//           this.router.navigate(['/login']);
//         }
//       });
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   get hasAccess(): boolean {
//     return this.currentUser?.role === UserRole.SUPER_ADMIN || this.currentUser?.role === UserRole.SOCIETY_ADMIN;
//   }

//   get isSuperAdmin(): boolean {
//     return this.currentUser?.role === UserRole.SUPER_ADMIN;
//   }

//   get selectedRoleInfo() {
//     const roleValue = this.userForm.get('role')?.value;
//     return this.availableRoles.find(role => role.value === roleValue);
//   }

//   setupRoleOptions() {
//     if (this.isSuperAdmin) {
//       this.availableRoles = [
//         { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' },
//         { value: UserRole.MEMBER, label: 'Regular User' }
//       ];
//     } else {
//       this.availableRoles = [
//         { value: UserRole.SOCIETY_ADMIN, label: 'Society Admin' },
//         { value: UserRole.MEMBER, label: 'Regular User' }
//       ];
//     }
//   }

//   createForm(): FormGroup {
//     return this.fb.group({
//       username: ['', [Validators.required, Validators.minLength(3)]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       confirmPassword: ['', [Validators.required]],
//       firstName: ['', [Validators.required]],
//       lastName: ['', [Validators.required]],
//       email: ['', [Validators.required, Validators.email]],
//       phone: [''],
//       role: ['', [Validators.required]]
//     }, { validators: this.passwordMatchValidator });
//   }

//   passwordMatchValidator(form: FormGroup) {
//     const password = form.get('password')?.value;
//     const confirmPassword = form.get('confirmPassword')?.value;

//     if (password !== confirmPassword) {
//       form.get('confirmPassword')?.setErrors({ mismatch: true });
//       return { mismatch: true };
//     } else {
//       const confirmPasswordControl = form.get('confirmPassword');
//       if (confirmPasswordControl?.errors?.['mismatch']) {
//         delete confirmPasswordControl.errors['mismatch'];
//         if (Object.keys(confirmPasswordControl.errors).length === 0) {
//           confirmPasswordControl.setErrors(null);
//         }
//       }
//     }
//     return null;
//   }

//   createUser() {
//     if (this.userForm.invalid) {
//       this.markFormGroupTouched(this.userForm);
//       return;
//     }

//     this.submitting = true;

//     const formValue = this.userForm.value;
//     const createUserDto: CreateUserDto = {
//       username: formValue.username,
//       password: formValue.password,
//       firstName: formValue.firstName,
//       lastName: formValue.lastName,
//       email: formValue.email,
//       phone: formValue.phone || '',
//       role: formValue.role,
//       societyId: this.currentUser?.societyId // society comes from logged-in user
//     };

//     this.userService.createUser(createUserDto)
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => {
//           this.submitting = false;
//         })
//       )
//       .subscribe({
//         next: () => {
//           this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
//           this.resetForm();
//         },
//         error: (err: any) => {
//           console.error('Error creating user:', err);
//           this.snackBar.open(
//             err.error?.message || 'Error creating user',
//             'Close',
//             { duration: 5000 }
//           );
//         }
//       });
//   }

//   resetForm() {
//     this.userForm.reset();
//     this.userForm.markAsUntouched();
//     this.userForm.markAsPristine();
//   }

//   private markFormGroupTouched(formGroup: FormGroup) {
//     Object.keys(formGroup.controls).forEach(key => {
//       const control = formGroup.get(key);
//       control?.markAsTouched();
//     });
//   }
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../../services/user.service';
import { AuthService, User } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="animate-fade-in">
      <div class="content-header">
        <h1 class="text-page-title">Create New User</h1>
        <p class="text-body text-gray-600">
          Add new users to the system (role is always set to <b>user</b>)
        </p>
      </div>

      <div *ngIf="!hasAccess" class="card mb-6 border-l-4 border-l-yellow-400">
        <div class="card-content flex items-center gap-3">
          <mat-icon class="text-yellow-500">security</mat-icon>
          <p>You don't have permission to create new users. Only admins can create users.</p>
        </div>
      </div>

      <form *ngIf="hasAccess" [formGroup]="userForm" class="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <!-- Username -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
      <input type="text" formControlName="username" autocomplete="username"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Password -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <input type="password" formControlName="password" autocomplete="new-password"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input type="email" formControlName="email"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Phone -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <input type="tel" formControlName="phone"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- EDP No -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">EDP No</label>
      <input type="text" formControlName="edpNo"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input type="text" formControlName="name"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Office Address -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
      <input type="text" formControlName="addressOffice"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Residential Address -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
      <input type="text" formControlName="addressResidential"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Designation -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Designation</label>
      <input type="text" formControlName="designation"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Office Phone -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Office Phone</label>
      <input type="text" formControlName="phoneOffice"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Residential Phone -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Residential Phone</label>
      <input type="text" formControlName="phoneResidential"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Mobile -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
      <input type="text" formControlName="mobile"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

  </div>

  <!-- Buttons -->
  <div class="flex justify-end gap-4 mt-6">
    <button type="button" (click)="resetForm()" [disabled]="submitting"
      class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50">
      Reset
    </button>
    <button type="button" (click)="createUser()" [disabled]="submitting || userForm.invalid"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
      {{ submitting ? 'Registering...' : 'Register User' }}
    </button>
  </div>
</form>

    </div>
  `
})
export class NewUserComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  submitting = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

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
        if (!user) {
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasAccess(): boolean {
    return !!this.currentUser; // only check if logged in admin
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      edpNo: [''],
      name: [''],
      addressOffice: [''],
      addressResidential: [''],
      designation: [''],
      phoneOffice: [''],
      phoneResidential: [''],
      mobile: ['']
    });
  }

  createUser() {
    if (this.userForm.invalid) {
      this.snackBar.open('Please fill in the required fields correctly.', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;

    const f = this.userForm.value;
    const payload = {
      username: f.username,
      password: f.password,
      email: f.email,
      phone: f.phone,
      EDPNo: f.edpNo,
      Name: f.name,
      AddressOffice: f.addressOffice,
      AddressResidential: f.addressResidential,
      Designation: f.designation,
      PhoneOffice: f.phoneOffice,
      PhoneResidential: f.phoneResidential,
      Mobile: f.mobile
    };

    this.userService.registerUser(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.snackBar.open('User registered successfully!', 'Close', { duration: 3000 });
            this.resetForm();
          } else {
            this.snackBar.open(res.message || 'Failed to register user', 'Close', { duration: 5000 });
          }
        },
        error: (err: any) => {
          this.snackBar.open(err.error?.message || 'Server error occurred', 'Close', { duration: 5000 });
        }
      });
  }

  resetForm() {
    this.userForm.reset();
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }
}
