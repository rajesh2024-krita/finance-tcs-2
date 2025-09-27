// src/app/components/file/society/society.component.ts
import { Component, OnInit } from '@angular/core';
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
import { SocietyService, SocietyDto, SocietyEditPending, SocietyTabsDto, LoanTypeDto } from '../../../services/society.service';
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

      <!-- Main Society Form -->
      <div>
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
                    formControlName="societyName"
                    placeholder="Enter society name"
                    [readonly]="!isEditing">
                  <div *ngIf="societyForm.get('societyName')?.invalid && societyForm.get('societyName')?.touched" 
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
            {{ loanGroup.get('loanType')?.value || 'New Loan' }}
          </button>
        </ng-container>
      </div>

      <button
        type="button"
        (click)="addLoanType(); activeLoanTab = loanTypesFormArray.length - 1"
        class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
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
        <!-- Interest -->
        <div>
          <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
            Interest (%)
          </label>
          <input type="number" formControlName="interest"
            class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <!-- Loan Limit -->
        <div>
          <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
            Loan Limit
          </label>
          <input type="number" formControlName="limit"
            class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <!-- Show remaining fields ONLY if General Loan -->
        <ng-container *ngIf="loanGroup.get('loanType')?.value === 'General Loan'">
          <div>
            <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
              Compulsory Deposit
            </label>
            <input type="number" formControlName="compulsoryDeposit"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
              Optional Deposit
            </label>
            <input type="number" formControlName="optionalDeposit"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
              Share Amount
            </label>
            <input type="number" formControlName="share"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
              N Times of Share Amount
            </label>
            <input type="number" formControlName="xTimes"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </ng-container>
      </div>

      <div class="flex justify-end mt-2">
        <button type="button" (click)="removeLoanType(i)" 
          class="text-red-500 hover:text-red-700 text-sm font-medium">
          Remove
        </button>
      </div>
    </div>
  </div>
</div>
          <!-- Additional Settings Section -->
          <div class="form-section">
            <!-- <div class="form-section-header">
              <mat-icon>settings</mat-icon>
              <span>Additional Settings</span>
            </div> -->
            <div class="form-section-content border">
              <div class="">
                <div class="w-full">
                  <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Cheque Bounce Charge (₹)</label>
                  <div class="flex justify-between gap-4">
                    <input 
                      type="number" 
                      class="block p-2 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      formControlName="chBounceCharge"
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
                          <option *ngFor="let charge of societyForm.get('dropdownArray')?.value" [value]="charge">
                            {{ charge }}
                          </option>
                        </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions --> 
           <!-- *ngIf="!isEditing && canEdit()"  -->
          <div class="">
            <div class="flex justify-end gap-3">
              <!-- [disabled]="societyForm.invalid || submitting" -->
              
              <!-- *ngIf="isEditing"  -->
              <div class="flex gap-3">
                <button 
                  type="button"
                  (click)="saveChanges()"
                  
                  class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                  <!-- <mat-icon>save</mat-icon> --> Save
                  <!-- {{ submitting ? 'Applying...' : (societyData ? 'Apply' : 'Create Society') }} -->
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SocietyComponent implements OnInit {
  societyForm: FormGroup;
  isEditing = false;
  loading = true;
  submitting = false;
  error: string | null = null;
  loanTypes: LoanTypeDto[] = [];

  societyData: SocietyDto | null = null;
  pendingRequest: SocietyEditPending | null = null;
  currentUser: User | null = null;
  activeLoanTab: number = 0;

  editingLoanIndex: number | null = null;
  showRenamePopup = false;
  renameValue = '';

  renameControl = new FormControl('');


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

  get loanTypesFormArray(): FormArray {
    return this.societyForm.get('loanTypes') as FormArray;
  }

  openRenamePopup(index: number) {
    this.editingLoanIndex = index;
    this.renameControl.setValue(
      this.loanTypesFormArray.at(index).get('loanType')?.value || ''
    );
    this.showRenamePopup = true;
  }

  saveRename() {
    if (this.editingLoanIndex !== null) {
      this.loanTypesFormArray
        .at(this.editingLoanIndex)
        .get('loanType')
        ?.setValue(this.renameControl.value);
    }
    this.closeRenamePopup();
  }
  closeRenamePopup() {
    this.showRenamePopup = false;
    this.editingLoanIndex = null;
    this.renameValue = '';
  }

  addLoanType(loan?: Partial<LoanTypeDto>) {
    console.log('Adding loan type:', loan);

    const group = this.fb.group({
      loanType: [loan?.LoanType || '', Validators.required],
      interest: [loan?.Interest || 0, [Validators.min(0), Validators.max(100)]],
      limit: [loan?.Limit || 0, Validators.min(0)],
      compulsoryDeposit: [loan?.CompulsoryDeposit || 0, Validators.min(0)],
      optionalDeposit: [loan?.OptionalDeposit || 0, Validators.min(0)],
      share: [loan?.Share || 0, Validators.min(0)],
      xTimes: [loan?.XTimes || 0, Validators.min(0)]
    });
    this.loanTypesFormArray.push(group);
  }


  removeLoanType(index: number) {
    this.loanTypesFormArray.removeAt(index);
  }


  private isPendingEdit(obj: any): obj is SocietyEditPending {
    return obj && typeof obj === 'object' && 'status' in obj;
  }

  activeTab: string = 'interest'; // default tab

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
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
      targetDropdown: [''],
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
      chBounceCharge: [0, Validators.min(0)],
      chequeReturnCharge: ['', Validators.required],  // dropdown selected value
      dropdownArray: this.fb.control<string[]>([]),
      cash: [0, Validators.min(0)],
      bonus: [0, Validators.min(0)],

      // 🔹 Add this
      loanTypes: this.fb.array([])
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
          console.log('📊 Raw society data:', society);

          this.societyData = society;
          this.populateForm(society);
          this.loadPendingRequests();

          // Extract and console loanTypes as array of objects
          this.extractAndLogLoanTypes(society);
        }
      });
  }

  private extractAndLogLoanTypes(society: any) {
    try {
      let parsedLoanTypes: LoanTypeDto[] = [];

      if (society.loanTypes) {
        if (typeof society.loanTypes === 'string') {
          // Parse the stringified JSON array
          parsedLoanTypes = JSON.parse(society.loanTypes);
        } else if (Array.isArray(society.loanTypes)) {
          // Already an array
          parsedLoanTypes = society.loanTypes;
        }
        this.loanTypes = parsedLoanTypes; // Store for later use if needed
        console.log('✅ Successfully parsed loanTypes:', this.loanTypes);


        // Optional: Log each loan type individually for better readability
        parsedLoanTypes.forEach((loanType, index) => {
          console.log(`📋 Loan Type ${index + 1}:`, loanType);
        });
      } else {
        console.log('ℹ️ No loanTypes data found in society');
        this.loanTypes = [];
      }
    } catch (error) {
      console.error('❌ Error parsing loanTypes:', error);
      this.loanTypes = [];
    }
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

  // Populate with backend data
  populateForm(society: any) {
    if (!society) {
      console.warn("⚠️ No society data provided");
      return;
    }

    try {
      console.log("📥 Raw society data received:", society);

      // ---------------- Tabs Extraction ----------------
      let tabs: SocietyTabsDto = {
        interest: { dividend: 0, od: 0, cd: 0, loan: 0, emergencyLoan: 0, las: 0 },
        limit: { share: 0, loan: 0, emergencyLoan: 0 }
      };

      if (society.tabs) {
        const parsedTabs = typeof society.tabs === "string"
          ? JSON.parse(society.tabs)
          : society.tabs;

        console.log("🗂 Parsed tabs object:", parsedTabs);

        if (parsedTabs.Interest) {
          tabs.interest = {
            dividend: parsedTabs.Interest.Dividend || 0,
            od: parsedTabs.Interest.OD || 0,
            cd: parsedTabs.Interest.CD || 0,
            loan: parsedTabs.Interest.Loan || 0,
            emergencyLoan: parsedTabs.Interest.EmergencyLoan || 0,
            las: parsedTabs.Interest.LAS || 0
          };
        }

        if (parsedTabs.Limit) {
          tabs.limit = {
            share: parsedTabs.Limit.Share || 0,
            loan: parsedTabs.Limit.Loan || 0,
            emergencyLoan: parsedTabs.Limit.EmergencyLoan || 0
          };
        }
      } else {
        console.log("ℹ️ No tabs data found in society");
      }

      // ---------------- Dropdown Array Extraction ----------------
      let parsedDropdownArray: string[] = [];
      try {
        parsedDropdownArray = typeof society.dropdownArray === "string"
          ? JSON.parse(society.dropdownArray || "[]")
          : society.dropdownArray || [];
      } catch {
        parsedDropdownArray = [];
      }
      console.log("📌 Parsed dropdown array:", parsedDropdownArray);

      // ---------------- LoanTypes Extraction ----------------
      let parsedLoanTypes: LoanTypeDto[] = [];
      console.log("🔍 checks ypes data:", society.loanTypes);

      if (society.loanTypes) {
        if (typeof society.loanTypes === "string") {
          parsedLoanTypes = JSON.parse(society.loanTypes);
        } else if (Array.isArray(society.loanTypes)) {
          parsedLoanTypes = society.loanTypes;
        }
      }
      console.log("💰 Parsed loanTypes:", parsedLoanTypes);
      this.loanTypes = parsedLoanTypes;

      // Clear existing FormArray before populating
      this.loanTypesFormArray.clear();
      parsedLoanTypes.forEach(loan => this.addLoanType(loan));

      // ---------------- Build Form Data ----------------
      const formData = {
        societyName: society.societyName || "",
        registrationNumber: society.registrationNumber || "",
        address: society.address || "",
        city: society.city || "",
        phone: society.phone || "",
        fax: society.fax || "",
        email: society.email || "",
        website: society.website || "",

        // Tabs
        dividend: tabs.interest.dividend,
        overdraft: tabs.interest.od,
        currentDeposit: tabs.interest.cd,
        loan: tabs.interest.loan,
        emergencyLoan: tabs.interest.emergencyLoan,
        las: tabs.interest.las,

        shareLimit: tabs.limit.share,
        loanLimit: tabs.limit.loan,
        emergencyLoanLimit: tabs.limit.emergencyLoan,

        // Charges and dropdowns
        targetDropdown: society.targetDropdown || "",
        dropdownArray: parsedDropdownArray,

        // Other
        chBounceCharge: society.chBounceCharge || 0,
        chequeReturnCharge: society.chequeReturnCharge || 0,
        cash: society.cash || 0,
        bonus: society.bonus || 0
      };

      console.log("📝 Final form data to patch:", formData);

      // ---------------- Patch Form ----------------
      this.societyForm.patchValue(formData);

    } catch (error) {
      console.error("❌ Error parsing society data:", error);
      this.error = "Failed to parse society data";
    }
  }




  enableEdit(index: number) {
    this.editingLoanIndex = index;
    // optional: delay focus after input renders
    setTimeout(() => {
      const input = document.getElementById('loanInput' + index) as HTMLInputElement;
      input?.focus();
    });
  }

  saveEdit() {
    this.editingLoanIndex = null;
  }

  cancelEdit() {
    this.editingLoanIndex = null;
  }


  // cancelEdit() {
  //   this.isEditing = false;
  //   if (this.societyData) {
  //     this.populateForm(this.societyData);
  //   } else {
  //     this.societyForm.reset();
  //   }
  // }

  saveChanges() {
    if (this.societyForm.invalid) {
      this.markFormGroupTouched(this.societyForm);
      return;
    }

    this.submitting = true;
    const formData = this.societyForm.value;

    // Prepare data for backend (convert dropdownArray to string if needed)
    const saveData: any = {
      ...formData,
      dropdownArray: Array.isArray(formData.dropdownArray)
        ? JSON.stringify(formData.dropdownArray)
        : formData.dropdownArray
    };

    const saveObservable = this.societyData
      ? this.societyService.updateSociety(this.societyData.id, saveData)
      : this.societyService.createSociety(saveData);

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