// src/app/components/file/society/society.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule, FormControl } from '@angular/forms';
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
import { SocietyService, SocietyDto, SocietyEditPending, LoanTypeDto, CreateSocietyDto } from '../../../services/society.service';
import { LoanTypeService } from '../../../services/loan-type.service';
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
    MatSnackBarModule,
    FormsModule
  ],
  template: `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div class="">
          <div class="uppercase text-lg mb-2">Society Details</div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center p-8">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <!-- Main Society Form -->
        <div *ngIf="!loading && !error">
          <form [formGroup]="societyForm" class="form-container">
            
            <!-- Basic Information Section -->
            <div class="form-section border">
              <div class="text-sm font-normal flex items-end gap-2 px-6 mt-2">
                <mat-icon class="text-indigo-500">business</mat-icon>
                <span>Basic Information</span>
              </div>
              <div class="form-section-content">
                <div class="form-grid form-grid-2">
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name</label>
                    <input 
                      type="text" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="name"
                      placeholder="Enter society name"
                      [readonly]="!isEditing">
                    <div *ngIf="societyForm.get('name')?.invalid && societyForm.get('name')?.touched" 
                        class="form-error">
                      Society name is required
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Registration Number</label>
                    <input 
                      type="text" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="registrationNumber"
                      placeholder="Enter registration number"
                      [readonly]="!isEditing">
                    <div *ngIf="societyForm.get('registrationNumber')?.invalid && societyForm.get('registrationNumber')?.touched" 
                        class="form-error">
                      Registration number is required
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Address</label>
                    <textarea 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="address"
                      placeholder="Enter complete address"
                      [readonly]="!isEditing"
                      rows="1"></textarea>
                    <div *ngIf="societyForm.get('address')?.invalid && societyForm.get('address')?.touched" 
                        class="form-error">
                      Address is required
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">City</label>
                    <input 
                      type="text" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            <div class="form-section border">
              <div class="text-sm font-normal flex items-end gap-2 px-6 mt-2">
                <mat-icon class="text-indigo-500">contact_phone</mat-icon>
                <span>Contact Information</span>
              </div>
              <div class="form-section-content">
                <div class="grid grid-cols-4 gap-4">
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Phone</label>
                    <input 
                      type="tel" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="phone"
                      placeholder="+91 9876543210"
                      [readonly]="!isEditing">
                    <div *ngIf="societyForm.get('phone')?.invalid && societyForm.get('phone')?.touched" 
                        class="form-error">
                      Phone number is required
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Fax</label>
                    <input 
                      type="tel" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="fax"
                      placeholder="+91 2234567890"
                      [readonly]="!isEditing">
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Email</label>
                    <input 
                      type="email" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="email"
                      placeholder="info@fintcs.com"
                      [readonly]="!isEditing">
                    <div *ngIf="societyForm.get('email')?.invalid && societyForm.get('email')?.touched" 
                        class="form-error">
                      Valid email is required
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Website</label>
                    <input 
                      type="url" 
                      class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="website"
                      placeholder="www.society.com"
                      [readonly]="!isEditing">
                  </div>
                </div>
              </div>
            </div>

            <!-- Loan Types Section -->
            <div class="p-4 bg-white shadow rounded-lg">
              <h2 class="text-lg font-normal mb-4">Loan Types</h2>

              <div formArrayName="loanTypes">
                <!-- Tab headers -->
                <div class="flex mb-4 overflow-x-auto justify-between">
                  <div>
                    <ng-container *ngFor="let loanGroup of loanTypesFormArray.controls; let i = index">
                      <button
                        type="button"
                        (click)="activeLoanTab = i"
                        (dblclick)="openRenamePopup(i)"
                        [ngClass]="{
                          'border-b-2 border-blue-600 font-normal text-blue-600': activeLoanTab === i,
                          'text-gray-600 hover:text-blue-600': activeLoanTab !== i
                        }"
                        class="px-4 py-2 focus:outline-none whitespace-nowrap"
                      >
                        {{ loanGroup.get('name')?.value || 'New Loan' }}
                      </button>
                    </ng-container>
                  </div>

                  <button
                    type="button"
                    (click)="addLoanType(); activeLoanTab = loanTypesFormArray.length - 1"
                    class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    [disabled]="!isEditing"
                  >
                    + Add New Loan Type
                  </button>
                </div>

                <!-- Rename Popup -->
                <div
                  *ngIf="showRenamePopup"
                  class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                >
                  <div class="bg-white rounded-lg shadow-lg p-6 w-80">
                    <h3 class="text-lg font-semibold mb-4">Rename Loan Type</h3>

                    <input
                      type="text"
                      [formControl]="renameControl"
                      class="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring"
                      placeholder="Enter new loan name"
                    />

                    <div class="flex justify-end gap-2">
                      <button
                        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        (click)="closeRenamePopup()"
                      >
                        Cancel
                      </button>
                      <button
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        (click)="saveRename()"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tab content -->
                <div *ngFor="let loanGroup of loanTypesFormArray.controls; let i = index" 
                    [hidden]="activeLoanTab !== i" 
                    [formGroupName]="i" 
                    class="border rounded p-4 mb-3 bg-gray-50">

                  <div class="grid grid-cols-3 gap-4">
                    <!-- Loan Type Name -->
                    <div>
                      <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                        Loan Type Name
                      </label>
                      <input type="text" formControlName="name"
                        class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                        [readonly]="!isEditing" />
                    </div>

                    <!-- Interest -->
                    <div>
                      <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                        Interest (%)
                      </label>
                      <input type="number" formControlName="interestPercent"
                        class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                        [readonly]="!isEditing" />
                    </div>

                    <!-- Loan Limit -->
                    <div>
                      <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                        Loan Limit
                      </label>
                      <input type="number" formControlName="limitAmount"
                        class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                        [readonly]="!isEditing" />
                    </div>

                    <!-- Show remaining fields ONLY if General Loan -->
                    <ng-container *ngIf="loanGroup.get('name')?.value === 'General Loan'">
                      <div>
                        <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                          Compulsory Deposit
                        </label>
                        <input type="number" formControlName="compulsoryDeposit"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                          [readonly]="!isEditing" />
                      </div>

                      <div>
                        <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                          Optional Deposit
                        </label>
                        <input type="number" formControlName="optionalDeposit"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                          [readonly]="!isEditing" />
                      </div>

                      <div>
                        <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                          Share Amount
                        </label>
                        <input type="number" formControlName="shareAmount"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                          [readonly]="!isEditing" />
                      </div>

                      <div>
                        <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                          N Times of Share Amount
                        </label>
                        <input type="number" formControlName="xTimes"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
                          [readonly]="!isEditing" />
                      </div>
                    </ng-container>
                  </div>

                  <div class="flex justify-end mt-2" *ngIf="isEditing">
                    <button type="button" (click)="deleteLoanType(i)" 
                      class="text-red-500 hover:text-red-700 text-sm font-medium">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Settings Section -->
            <div class="form-section">
              <div class="form-section-content border">
                <div class="">
                  <div class="w-full">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Cheque Bounce Charge (₹)</label>
                    <div class="flex justify-between gap-4">
                      <input 
                        type="number" 
                        class="block p-2 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        formControlName="chequeBounceCharge"
                        placeholder="500"
                        min="0"
                        [readonly]="!isEditing">
                      <select
                        formControlName="targetDropdown"
                        class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 
                              focus:ring-blue-500 focus:border-blue-500 
                              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                              dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        [disabled]="!isEditing">
                        <option value="" disabled>Select charge</option>
                        <option *ngFor="let charge of bankNames" [value]="charge">
                          {{ charge }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-6">
              <div class="flex justify-end gap-3">
                <div class="flex gap-3">
                  <button 
                    *ngIf="!isEditing && canEdit()"
                    type="button"
                    (click)="enableEditing()"
                    class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                    Edit Society
                  </button>
                  
                  <button 
                    *ngIf="isEditing"
                    type="button"
                    (click)="cancelEditing()"
                    class="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium">
                    Cancel
                  </button>
                  
                  <button 
                    type="button"
                    (click)="saveChanges()"
                    [disabled]="societyForm.invalid || submitting"
                    class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:bg-gray-400">
                    {{ submitting ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `,
  styles: [`
      .form-error {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      .form-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .form-section {
        margin-bottom: 1.5rem;
        border-radius: 0.5rem;
        background: white;
      }
      .form-section-content {
        padding: 1.5rem;
      }
      .form-grid {
        display: grid;
        gap: 1rem;
      }
      .form-grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }
      .form-field {
        margin-bottom: 1rem;
      }
    `]
})
export class SocietyComponent implements OnInit, OnDestroy {
  societyForm: FormGroup;
  isEditing = false;
  loading = true;
  submitting = false;
  error: string | null = null;

  societyData: SocietyDto | null = null;
  pendingRequest: SocietyEditPending | null = null;
  currentUser: User | null = null;

  activeLoanTab = 0;
  editingLoanIndex: number | null = null;
  showRenamePopup = false;
  renameControl = new FormControl('');
  bankNames: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private societyService: SocietyService,
    private loanTypeService: LoanTypeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.societyForm = this.createForm();
  }

  get loanTypesFormArray(): FormArray {
    return this.societyForm.get('loanTypes') as FormArray;
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) this.loadData();
        else this.router.navigate(['/login']);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canEdit(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN || this.currentUser?.role === UserRole.SOCIETY_ADMIN;
  }

  canApprove(): boolean {
    if (!this.pendingRequest || !this.currentUser) return false;
    const existing = this.pendingRequest.approvals.find(a => a.userId === this.currentUser!.id);
    return !existing && (this.currentUser.role === UserRole.SUPER_ADMIN || this.currentUser.role === UserRole.SOCIETY_ADMIN);
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      fax: [''],
      email: ['', [Validators.required, Validators.email]],
      website: [''],
      chequeBounceCharge: [0, [Validators.required, Validators.min(0)]],
      targetDropdown: [''],
      loanTypes: this.fb.array([])
    });
  }

  loadData() {
    this.loading = true;
    this.societyService.getSociety()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading society:', err);
          this.error = err.message || 'Failed to load society data';
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((society: SocietyDto | null) => {
        if (society) {
          this.societyData = society;
          this.populateForm(society);
          this.bankNames = society.bankAccounts?.map(b => b.bankName) || [];
        } else {
          this.error = 'No society data found';
        }
        this.loadPendingRequests();
      });
  }

  loadPendingRequests() {
    if (!this.canApprove()) return;
    this.societyService.getPendingEdits()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      )
      .subscribe(pendingEdits => {
        this.pendingRequest = pendingEdits.find(p => p.status === 'Pending') || null;
      });
  }

  populateForm(society: SocietyDto) {
    const formData = {
      name: society.name,
      registrationNumber: society.registrationNumber,
      address: society.address,
      city: society.city,
      phone: society.phone,
      fax: society.fax || '',
      email: society.email,
      website: society.website || '',
      chequeBounceCharge: society.chequeBounceCharge,
      targetDropdown: ''
    };

    this.societyForm.patchValue(formData);

    // Populate loan types
    this.loanTypesFormArray.clear();
    (society.loanTypes || []).forEach(loan => this.addLoanType(loan));
  }

  addLoanType(loan?: LoanTypeDto) {
    const group = this.fb.group({
      loanTypeId: [loan?.loanTypeId || null],
      name: [loan?.name || 'General Loan', Validators.required],
      interestPercent: [loan?.interestPercent || 0, [Validators.min(0), Validators.max(100)]],
      limitAmount: [loan?.limitAmount || 0, Validators.min(0)],
      compulsoryDeposit: [loan?.compulsoryDeposit || 0, Validators.min(0)],
      optionalDeposit: [loan?.optionalDeposit || 0, Validators.min(0)],
      shareAmount: [loan?.shareAmount || 0, Validators.min(0)],
      xTimes: [loan?.xTimes || 0, Validators.min(0)]
    });
    this.loanTypesFormArray.push(group);
  }

  deleteLoanType(index: number) {
    const loanGroup = this.loanTypesFormArray.at(index);
    const loanTypeId = loanGroup.get('loanTypeId')?.value;

    if (loanTypeId) {
      // Call API only if loanTypeId exists (i.e., it's saved in backend)
      this.loanTypeService.deleteLoanType(loanTypeId).subscribe({
        next: () => {
          console.log('Loan type deleted successfully:', loanTypeId);
          this.snackBar.open('Loan type deleted successfully', 'Close', { duration: 3000 });
          this.removeLoanTypeFromForm(index);
        },
        error: (err) => {
          console.error('Failed to delete loan type:', err);
          this.snackBar.open(err.message || 'Failed to delete loan type', 'Close', { duration: 5000 });
        }
      });
    } else {
      // If it's a new unsaved loan type, just remove from form array
      this.removeLoanTypeFromForm(index);
    }
  }

  // Helper to remove from FormArray and adjust active tab
  private removeLoanTypeFromForm(index: number) {
    this.loanTypesFormArray.removeAt(index);
    if (this.activeLoanTab >= index && this.activeLoanTab > 0) {
      this.activeLoanTab--;
    }
  }

  openRenamePopup(index: number) {
    if (!this.isEditing) return;
    this.editingLoanIndex = index;
    this.renameControl.setValue(this.loanTypesFormArray.at(index).get('name')?.value || '');
    this.showRenamePopup = true;
  }

  saveRename() {
    if (this.editingLoanIndex !== null) {
      this.loanTypesFormArray.at(this.editingLoanIndex).get('name')?.setValue(this.renameControl.value);
    }
    this.closeRenamePopup();
  }

  closeRenamePopup() {
    this.showRenamePopup = false;
    this.editingLoanIndex = null;
    this.renameControl.setValue('');
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    if (this.societyData) {
      this.populateForm(this.societyData);
    }
  }

  saveChanges() {
    if (this.societyForm.invalid) {
      Object.values(this.societyForm.controls).forEach(c => {
        if (c.invalid) {
          c.markAsTouched();
          c.markAsDirty();
        }
      });

      // Mark all loan type controls as touched
      this.loanTypesFormArray.controls.forEach((loanGroup: any) => {
        Object.values(loanGroup?.controls).forEach((control: any) => {
          if (control?.invalid) {
            control?.markAsTouched();
            control?.markAsDirty();
          }
        });
      });

      this.snackBar.open('Please fix validation errors before saving', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formData = this.societyForm.value;

    // Transform loan types with proper integer ID handling
    const loanTypes = formData.loanTypes.map((lt: any) => {
      // Handle loanTypeId - ensure it's either a valid integer or null for new records
      let loanTypeId = lt.loanTypeId;

      // If loanTypeId exists but is not a valid integer, set to null (new record)
      if (loanTypeId && !this.isValidInteger(loanTypeId)) {
        console.warn('Invalid integer format for loanTypeId:', loanTypeId);
        loanTypeId = null;
      }

      // If loanTypeId is empty string, set to null
      if (loanTypeId === '') {
        loanTypeId = null;
      }

      return {
        loanTypeId: loanTypeId,
        societyId: this.societyData?.id || '',
        name: lt.name,
        interestPercent: Number(lt.interestPercent),
        limitAmount: Number(lt.limitAmount),
        compulsoryDeposit: Number(lt.compulsoryDeposit) || 0,
        optionalDeposit: Number(lt.optionalDeposit) || 0,
        shareAmount: Number(lt.shareAmount) || 0,
        xTimes: Number(lt.xTimes) || 0,
        createdAt: this.societyData?.loanTypes?.find(l => l.loanTypeId === lt.loanTypeId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const updateData: Partial<CreateSocietyDto> = {
      name: formData.name,
      registrationNumber: formData.registrationNumber,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      fax: formData.fax || undefined,
      email: formData.email,
      website: formData.website || undefined,
      chequeBounceCharge: Number(formData.chequeBounceCharge),
      loanTypes: loanTypes,
      bankAccounts: this.societyData?.bankAccounts || [],
      members: this.societyData?.members || []
    };

    console.log('Saving data:', JSON.stringify(updateData, null, 2));

    if (!this.societyData?.id) {
      this.snackBar.open('Society ID not found', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    this.societyService.updateSociety(this.societyData.id, updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: (res) => {
          this.isEditing = false;
          this.societyData = res;
          this.snackBar.open('Society saved successfully', 'Close', { duration: 3000 });
          this.societyService.setCurrentSociety(this.societyData);

          // Save loan types separately with proper error handling
          if (loanTypes.length > 0) {
            this.saveLoanTypesSequentially(loanTypes);
          }
        },
        error: (err) => {
          console.error('Save error:', err);
          this.snackBar.open(
            err.message || 'Failed to save changes',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  // Replace GUID validation with integer validation
  private isValidInteger(value: any): boolean {
    // Check if value is a valid integer (including string representations)
    if (value === null || value === undefined) return false;
    
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num >= 0;
  }

  // Update the loan type saving method to use integers
  private saveLoanTypesSequentially(loanTypes: any[]): void {
    let index = 0;
    let successCount = 0;
    let errorCount = 0;

    const saveNextLoanType = () => {
      if (index >= loanTypes.length) {
        console.log(`Loan type processing completed: ${successCount} success, ${errorCount} errors`);
        if (errorCount === 0) {
          this.snackBar.open(`All ${successCount} loan types saved successfully`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Saved ${successCount} loan types, ${errorCount} failed`, 'Close', { duration: 5000 });
        }
        return;
      }

      const loanType = loanTypes[index];
      index++;

      console.log('Processing loan type:', index - 1, loanType);

      // Create a clean loanTypeData object with only the necessary fields
      const loanTypeData: any = {
        name: loanType.name || 'General Loan',
        interestPercent: Number(loanType.interestPercent) || 0,
        limitAmount: Number(loanType.limitAmount) || 0,
        societyId: this.societyData?.id || ''
      };
      
      // Add optional fields only if they exist and are valid
      if (loanType.compulsoryDeposit !== undefined) {
        loanTypeData.compulsoryDeposit = Number(loanType.compulsoryDeposit) || 0;
      }
      if (loanType.optionalDeposit !== undefined) {
        loanTypeData.optionalDeposit = Number(loanType.optionalDeposit) || 0;
      }
      if (loanType.shareAmount !== undefined) {
        loanTypeData.shareAmount = Number(loanType.shareAmount) || 0;
      }
      if (loanType.xTimes !== undefined) {
        loanTypeData.xTimes = Number(loanType.xTimes) || 0;
      }

      console.log('LoanTypeData to send:', loanTypeData);

      // Determine if it's a create or update operation
      const isUpdate = loanType.loanTypeId && this.isValidInteger(loanType.loanTypeId);
      console.log('loanType.loanTypeId == ', loanType.loanTypeId);

      const loanTypeObservable = isUpdate
        ? this.loanTypeService.updateLoanType(loanType.loanTypeId, loanTypeData)
        : this.loanTypeService.createLoanType(loanTypeData);

      loanTypeObservable.subscribe({
        next: (ltRes) => {
          console.log('✅ Loan type saved successfully:', ltRes);
          successCount++;
          saveNextLoanType();
        },
        error: (ltErr) => {
          console.error('❌ LoanType save error:', ltErr);
          errorCount++;

          // Enhanced error logging
          this.logLoanTypeError(ltErr, loanType);
          saveNextLoanType();
        }
      });
    };

    saveNextLoanType();
  }

  // Add this helper method for better error logging
  private logLoanTypeError(error: any, loanType: any): void {
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      loanType: loanType,
      errorResponse: error.error
    });

    let errorMessage = `Failed to save "${loanType.name}"`;

    if (error.error?.errors) {
      // Handle validation errors
      errorMessage += `: ${JSON.stringify(error.error.errors)}`;
    } else if (error.error?.message) {
      errorMessage += `: ${error.error.message}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    this.snackBar.open(errorMessage, 'Close', { duration: 6000 });
  }
}