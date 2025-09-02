import { Component, OnInit } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocietyService, SocietyDto, SocietyEditPending, CreateSocietyDto } from '../../../services/society.service';
import { AuthService, User, UserRole } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, takeUntil, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-society',
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
    MatChipsModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="content-header">
        <div class="breadcrumb">
          <span>File</span>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-active">Society</span>
        </div>
        <h1 class="text-page-title">Society Management</h1>
        <p class="text-body text-gray-600 dark:text-gray-400">Manage society information, interest rates, and limits</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p class="text-center mt-4">Loading society data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="card mb-6 border-l-4 border-l-red-400">
        <div class="card-content">
          <div class="flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            <div>
              <h4 class="text-section-header text-red-700">Error Loading Society Data</h4>
              <p class="text-body text-red-600">{{ error }}</p>
            </div>
          </div>
          <button (click)="loadData()" class="btn btn-primary mt-4">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      </div>

      <!-- No Society for Super Admin - Create Option -->
      <div *ngIf="!societyData && isSuperAdmin && !loading && !error" class="card mb-6 border-l-4 border-l-blue-400">
        <div class="card-header bg-gradient-to-r from-blue-500 to-cyan-500">
          <div class="card-title">
            <mat-icon>business</mat-icon>
            <span>Create New Society</span>
          </div>
        </div>
        <div class="card-content">
          <p class="text-body mb-4">No society data found. As a Super Admin, you can create a new society.</p>
          <button (click)="enableEdit()" class="btn btn-primary">
            <mat-icon>add</mat-icon>
            Create New Society
          </button>
        </div>
      </div>

      <!-- Pending Approval Alert -->
      <div *ngIf="pendingRequest && !loading" class="card mb-6 border-l-4 border-l-orange-400">
        <div class="card-header bg-gradient-to-r from-orange-500 to-red-500">
          <div class="card-title">
            <mat-icon>pending_actions</mat-icon>
            <span>Pending Approval Request</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <mat-icon class="text-lg">schedule</mat-icon>
            <span>{{ pendingRequest.requestedAt | date:'short' }}</span>
          </div>
        </div>
        <div class="card-content">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            <!-- Request Info -->
            <div>
              <h4 class="text-section-header mb-3">Request Details</h4>
              <div class="space-y-2 text-body">
                <div class="flex justify-between">
                  <span class="text-gray-600">Requested by:</span>
                  <span class="font-medium">{{ pendingRequest.requestedByUserName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status:</span>
                  <span class="badge badge-warning">{{ pendingRequest.status | titlecase }}</span>
                </div>
              </div>
            </div>

            <!-- Approval Progress -->
            <div>
              <h4 class="text-section-header mb-3">Approval Progress</h4>
              <div class="space-y-3">
                <div class="flex justify-between text-body">
                  <span>{{ getApprovedCount() }} of {{ getTotalRequired() }} approved</span>
                  <span class="font-medium">{{ getApprovalProgress() | number:'1.0-0' }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getApprovalProgress()">
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div>
              <h4 class="text-section-header mb-3">Actions</h4>
              <div class="space-y-2">
                <button 
                  *ngIf="canApprove()" 
                  (click)="approvePendingEdit()"
                  [disabled]="submitting"
                  class="btn btn-success btn-sm w-full">
                  <mat-icon class="text-sm">check_circle</mat-icon>
                  Approve Changes
                </button>
                <button 
                  *ngIf="canApprove()" 
                  (click)="rejectPendingEdit()"
                  [disabled]="submitting"
                  class="btn btn-danger btn-sm w-full">
                  <mat-icon class="text-sm">cancel</mat-icon>
                  Reject Changes
                </button>
              </div>
            </div>
          </div>

          <!-- Approval Status List -->
          <div class="border-t pt-4">
            <h4 class="text-section-header mb-3">Approval Status</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div *ngFor="let approval of pendingRequest.approvals" 
                   class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <mat-icon [class]="approval.approved ? 'text-green-500' : 'text-gray-400'">
                    {{ approval.approved ? 'check_circle' : 'schedule' }}
                  </mat-icon>
                  <div>
                    <p class="font-medium text-sm">{{ approval.userName }}</p>
                    <p class="text-xs text-gray-500">
                      {{ approval.approved && approval.approvedAt ? (approval.approvedAt | date:'short') : 'Pending' }}
                    </p>
                  </div>
                </div>
                <span [class]="approval.approved ? 'badge badge-success' : 'badge badge-secondary'">
                  {{ approval.approved ? 'Approved' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Society Form -->
      <div *ngIf="(societyData || isSuperAdmin) && !loading">
        <form [formGroup]="societyForm" class="form-container">
          
          <!-- Basic Information Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>business</mat-icon>
              <span>Basic Information</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-2">
                <div class="form-field">
                  <label class="form-label form-label-required">Society Name</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="societyName"
                    placeholder="Enter society name"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('societyName')?.invalid && societyForm.get('societyName')?.touched" 
                       class="form-error">
                    Society name is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Registration Number</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="registrationNumber"
                    placeholder="Enter registration number"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('registrationNumber')?.invalid && societyForm.get('registrationNumber')?.touched" 
                       class="form-error">
                    Registration number is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Address</label>
                  <textarea 
                    class="form-textarea"
                    formControlName="address"
                    placeholder="Enter complete address"
                    [readonly]="!isEditing"
                    rows="3"></textarea>
                  <div *ngIf="societyForm.get('address')?.invalid && societyForm.get('address')?.touched" 
                       class="form-error">
                    Address is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">City</label>
                  <input 
                    type="text" 
                    class="form-input"
                    formControlName="city"
                    placeholder="Enter city name"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('city')?.invalid && societyForm.get('city')?.touched" 
                       class="form-error">
                    City is required
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>contact_phone</mat-icon>
              <span>Contact Information</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-2">
                <div class="form-field">
                  <label class="form-label form-label-required">Phone</label>
                  <input 
                    type="tel" 
                    class="form-input"
                    formControlName="phone"
                    placeholder="+91 9876543210"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('phone')?.invalid && societyForm.get('phone')?.touched" 
                       class="form-error">
                    Phone number is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label">Fax</label>
                  <input 
                    type="tel" 
                    class="form-input"
                    formControlName="fax"
                    placeholder="+91 2234567890"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label form-label-required">Email</label>
                  <input 
                    type="email" 
                    class="form-input"
                    formControlName="email"
                    placeholder="info@society.com"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('email')?.invalid && societyForm.get('email')?.touched" 
                       class="form-error">
                    Valid email is required
                  </div>
                </div>
                
                <div class="form-field">
                  <label class="form-label">Website</label>
                  <input 
                    type="url" 
                    class="form-input"
                    formControlName="website"
                    placeholder="www.society.com"
                    [readonly]="!isEditing">
                </div>
              </div>
            </div>
          </div>

          <!-- Interest Rates Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>trending_up</mat-icon>
              <span>Interest Rates (%)</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-3">
                <div class="form-field">
                  <label class="form-label">Dividend</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="dividend"
                    placeholder="8.5"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Overdraft (OD)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="overdraft"
                    placeholder="12.0"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Current Deposit (CD)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="currentDeposit"
                    placeholder="6.5"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Loan</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="loan"
                    placeholder="10.0"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Emergency Loan</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="emergencyLoan"
                    placeholder="15.0"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">LAS</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="las"
                    placeholder="7.5"
                    step="0.1"
                    min="0"
                    max="100"
                    [readonly]="!isEditing">
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Limits Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>account_balance</mat-icon>
              <span>Financial Limits</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-3">
                <div class="form-field">
                  <label class="form-label">Share Limit (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="shareLimit"
                    placeholder="500000"
                    min="0"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Loan Limit (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="loanLimit"
                    placeholder="1000000"
                    min="0"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Emergency Loan Limit (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="emergencyLoanLimit"
                    placeholder="200000"
                    min="0"
                    [readonly]="!isEditing">
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Settings Section -->
          <div class="form-section">
            <div class="form-section-header">
              <mat-icon>settings</mat-icon>
              <span>Additional Settings</span>
            </div>
            <div class="form-section-content">
              <div class="form-grid form-grid-4">
                <div class="form-field">
                  <label class="form-label">Cheque Bounce Charge (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="chequeBounceCharge"
                    placeholder="500"
                    min="0"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Cheque Return Charge (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="chequeReturnCharge"
                    placeholder="300"
                    min="0"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Cash (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="cash"
                    placeholder="1000"
                    min="0"
                    [readonly]="!isEditing">
                </div>
                
                <div class="form-field">
                  <label class="form-label">Bonus (₹)</label>
                  <input 
                    type="number" 
                    class="form-input"
                    formControlName="bonus"
                    placeholder="2500"
                    min="0"
                    [readonly]="!isEditing">
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="card-actions">
            <div class="flex justify-end gap-3">
              <button 
                *ngIf="!isEditing && canEdit()" 
                type="button"
                (click)="enableEdit()"
                class="btn btn-primary">
                <mat-icon>edit</mat-icon>
                {{ societyData ? 'Edit Society Details' : 'Create Society' }}
              </button>
              
              <div *ngIf="isEditing" class="flex gap-3">
                <button 
                  type="button"
                  (click)="cancelEdit()"
                  [disabled]="submitting"
                  class="btn btn-secondary">
                  <mat-icon>close</mat-icon>
                  Cancel
                </button>
                <button 
                  type="button"
                  (click)="saveChanges()"
                  [disabled]="societyForm.invalid || submitting"
                  class="btn btn-success">
                  <mat-icon>save</mat-icon>
                  {{ submitting ? 'Saving...' : (societyData ? 'Save Changes' : 'Create Society') }}
                </button>
              </div>
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

    .border-l-orange-400 {
      border-left-color: #fb923c;
    }

    .border-l-red-400 {
      border-left-color: #f87171;
    }

    .border-l-blue-400 {
      border-left-color: #60a5fa;
    }

    .grid {
      display: grid;
    }

    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (min-width: 768px) {
      .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }

    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }

    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1rem; }

    .p-3 { padding: 0.75rem; }
    .pt-4 { padding-top: 1rem; }

    .w-full { width: 100%; }
    .h-2 { height: 0.5rem; }

    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-200 { background-color: #e5e7eb; }

    .dark .bg-gray-700 { background-color: #374151; }
    .dark .bg-gray-800 { background-color: #1f2937; }

    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }

    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }

    .font-medium { font-weight: 500; }

    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-green-500 { color: #10b981; }
    .text-red-500 { color: #ef4444; }
    .text-red-600 { color: #dc2626; }
    .text-red-700 { color: #b91c1c; }

    .transition-all { transition-property: all; }
    .duration-300 { transition-duration: 300ms; }

    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }

    .border-t { border-top: 1px solid var(--color-border-primary); }

    .text-center { text-align: center; }

    .form-error {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
      border: none;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class SocietyComponent implements OnInit {
  societyForm: FormGroup;
  isEditing = false;
  loading = true;
  submitting = false;
  error: string | null = null;

  societyData: SocietyDto | null = null;
  pendingRequest: SocietyEditPending | null = null;
  currentUser: User | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private societyService: SocietyService,
    private authService: AuthService,
    private router: Router,
    
  ) {
    this.societyForm = this.createForm();
  }

  private isPendingEdit(obj: any): obj is SocietyEditPending {
  return obj && typeof obj === 'object' && 'status' in obj;
}


  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadData();
        } else {
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN;
  }

  get isSocietyAdmin(): boolean {
    return this.currentUser?.role === UserRole.SOCIETY_ADMIN;
  }

  canEdit(): boolean {
    return this.isSuperAdmin || this.isSocietyAdmin;
  }

  canApprove(): boolean {
    if (!this.pendingRequest || !this.currentUser) return false;

    // Check if user already approved/rejected
    const existingApproval = this.pendingRequest.approvals.find(
      approval => approval.userId === this.currentUser!.id
    );

    return !existingApproval && (this.isSuperAdmin || this.isSocietyAdmin);
  }

  createForm(): FormGroup {
    return this.fb.group({
      societyName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      fax: [''],
      email: ['', [Validators.required, Validators.email]],
      website: [''],
      dividend: [0, [Validators.min(0), Validators.max(100)]],
      overdraft: [0, [Validators.min(0), Validators.max(100)]],
      currentDeposit: [0, [Validators.min(0), Validators.max(100)]],
      loan: [0, [Validators.min(0), Validators.max(100)]],
      emergencyLoan: [0, [Validators.min(0), Validators.max(100)]],
      las: [0, [Validators.min(0), Validators.max(100)]],
      shareLimit: [0, Validators.min(0)],
      loanLimit: [0, Validators.min(0)],
      emergencyLoanLimit: [0, Validators.min(0)],
      chequeBounceCharge: [0, Validators.min(0)],
      chequeReturnCharge: [0, Validators.min(0)],
      cash: [0, Validators.min(0)],
      bonus: [0, Validators.min(0)]
    });
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load society data first
    this.societyService.getSociety()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading society:', err);
          this.error = err.error?.message || 'Failed to load society data';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(society => {
        if (society) {
          this.societyData = society;
          this.populateForm(society);
          this.loadPendingRequests();
        }
      });
  }

  loadPendingRequests() {
    if (!this.canApprove()) return;

    this.societyService.getPendingEdits()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading pending edits:', err);
          return of([]);
        })
      )
      .subscribe(pendingEdits => {
        // Get the first pending request
        this.pendingRequest = pendingEdits.find(edit => edit.status === 'Pending') || null;
      });
  }

  populateForm(society: SocietyDto) {
    this.societyForm.patchValue({
      societyName: society.societyName,
      registrationNumber: society.registrationNumber,
      address: society.address,
      city: society.city,
      phone: society.phone,
      fax: society.fax || '',
      email: society.email,
      website: society.website || '',
      dividend: society.dividend,
      overdraft: society.overdraft,
      currentDeposit: society.currentDeposit,
      loan: society.loan,
      emergencyLoan: society.emergencyLoan,
      las: society.las,
      shareLimit: society.shareLimit,
      loanLimit: society.loanLimit,
      emergencyLoanLimit: society.emergencyLoanLimit,
      chequeBounceCharge: society.chequeBounceCharge,
      chequeReturnCharge: society.chequeReturnCharge,
      cash: society.cash,
      bonus: society.bonus
    });
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.societyData) {
      this.populateForm(this.societyData);
    } else {
      this.societyForm.reset();
    }
  }

  saveChanges() {
    if (this.societyForm.invalid) {
      this.markFormGroupTouched(this.societyForm);
      return;
    }

    this.submitting = true;
    const formData = this.societyForm.value as CreateSocietyDto;

    const saveObservable = this.societyData
      ? this.societyService.updateSociety(this.societyData.id, formData)
      : this.societyService.createSociety(formData);

    saveObservable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.isEditing = false;

          if (this.isPendingEdit(result)) {
  this.snackBar.open('Changes submitted for approval', 'Close', { duration: 3000 });
  this.pendingRequest = result;
} else {
  this.societyData = result as SocietyDto;
  this.snackBar.open(
    this.societyData ? 'Society updated successfully' : 'Society created successfully',
    'Close',
    { duration: 3000 }
  );
  this.societyService.setCurrentSociety(this.societyData);
}

        },
        error: (err) => {
          console.error('Error saving society:', err);
          this.snackBar.open(
            err.error?.message || 'Error saving changes',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  approvePendingEdit() {
    if (!this.pendingRequest) return;

    this.submitting = true;
    this.societyService.reviewPendingEdit(this.pendingRequest.id, true)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Changes approved successfully', 'Close', { duration: 3000 });
          this.loadData(); // Reload to get updated data
        },
        error: (err) => {
          console.error('Error approving changes:', err);
          this.snackBar.open(
            err.error?.message || 'Error approving changes',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  rejectPendingEdit() {
    if (!this.pendingRequest) return;

    this.submitting = true;
    this.societyService.reviewPendingEdit(this.pendingRequest.id, false, 'Rejected by user')
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Changes rejected', 'Close', { duration: 3000 });
          this.loadData(); // Reload to get updated data
        },
        error: (err) => {
          console.error('Error rejecting changes:', err);
          this.snackBar.open(
            err.error?.message || 'Error rejecting changes',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  getApprovedCount(): number {
    if (!this.pendingRequest) return 0;
    return this.pendingRequest.approvals.filter(approval => approval.approved).length;
  }

  getTotalRequired(): number {
    if (!this.pendingRequest) return 0;
    return this.pendingRequest.approvals.length;
  }

  getApprovalProgress(): number {
    const total = this.getTotalRequired();
    if (total === 0) return 0;
    return (this.getApprovedCount() / total) * 100;
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}