import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-loan-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div class="mb-4 md:mb-0">  
          <h2 class="text-2xl font-bold mb-1">Loan Entry Form</h2>
          <p class="text-sm text-indigo-100 opacity-90">Create and manage loan applications</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <button (click)="onValidate()" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors shadow-sm">
            Validate
          </button>
          <button (click)="onSave()" [disabled]="!canSave" 
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors shadow-sm">
            Save
          </button>
          <button (click)="onClear()" class="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium transition-colors">
            Clear
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-6 p-6">
        <!-- Loan Type Section -->
        <div class="bg-gray-50 p-4 rounded-lg border">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            Loan Type
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
              <select formControlName="loanType" (change)="onLoanTypeChange()" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                <option *ngFor="let type of loanTypes" [value]="type">{{type}}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loan Details Section -->
        <div class="bg-gray-50 p-4 rounded-lg border">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Loan Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Loan No.</label>
              <div class="flex items-center gap-2">
                <input formControlName="loanNo" 
                  class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Loan Date</label>
              <input type="date" formControlName="loanDate" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">EDP No.</label>
              <select formControlName="edpNo" (change)="onEdpSelect()" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="">-- Select Member --</option>
                <option *ngFor="let m of members" [value]="m.memNo">{{ m.memNo }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name (member)</label>
              <input formControlName="member" readonly 
                class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
              <input type="number" formControlName="loanAmount" (input)="recalculate()" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Previous Loan (Remaining)</label>
              <input type="number" formControlName="previousLoan" (input)="recalculate()"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        <!-- Loan Calculation Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Loan Calculations
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Net Loan (Auto)</label>
                <input [value]="formatCurrency(netLoan())" readonly 
                  class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 font-medium text-blue-700" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  No. of Installments
                </label>
                <input
                  type="number"
                  formControlName="installments"
                  (input)="recalculate()"
                  class="w-full p-3 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                        transition-colors"
                />

                <!-- Error Message -->
                <p *ngIf="form.get('installments')?.errors?.['max'] && form.get('installments')?.touched"
                  class="text-red-500 text-sm mt-1">
                  Maximum allowed installments is 60
                </p>
              </div>

              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Installment Amount (Auto)</label>
                <input [value]="formatCurrency(installmentAmount())" readonly 
                  class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 font-medium text-blue-700" />
              </div>

              <div class="sr-only">
                <label class="block text-sm font-medium text-gray-700 mb-1">Interest Rate (Auto)</label>
                <input [value]="(interestRate*100).toFixed(2) + '%'" readonly 
                  class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Additional Information
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea formControlName="purpose" rows="4" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Authorized By <span class="text-xs text-gray-500">(In the case of Limit Exceed)</span>
                </label>
                <input formControlName="authorizedBy" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Mode Section -->
        <div class="bg-gray-50 p-4 rounded-lg border">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Details
          </h3>
          
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <div class="flex flex-wrap gap-4">
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input type="radio" formControlName="paymentMode" value="Cash" (change)="onPaymentModeChange()" class="text-indigo-600 focus:ring-indigo-500" />
                  <span>Cash</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input type="radio" formControlName="paymentMode" value="Cheque" (change)="onPaymentModeChange()" class="text-indigo-600 focus:ring-indigo-500" />
                  <span>Cheque</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input type="radio" formControlName="paymentMode" value="Opening" (change)="onPaymentModeChange()" class="text-indigo-600 focus:ring-indigo-500" />
                  <span>Opening</span>
                </label>
              </div>
            </div>

            <div *ngIf="isCheque()" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-white rounded-lg border">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                <select formControlName="bank" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                  <option value="">-- Select Bank --</option>
                  <option *ngFor="let b of banks" [value]="b">{{b}}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cheque No.</label>
                <input formControlName="chequeNo" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cheque Date</label>
                <input type="date" formControlName="chequeDate" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <!-- Member Information Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column: Member History -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Member History
            </h3>
            
            <div class="grid grid-cols-1 gap-4">
              <div class="bg-white p-3 rounded-lg border">
                <label class="block text-xs font-medium text-gray-500 mb-1">Share</label>
                <div class="text-lg font-semibold text-blue-700">{{formatCurrency(selectedMember?.share ?? 0)}}</div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200" *ngIf="isGeneralLoan()">
              <h4 class="text-md font-medium text-gray-700 mb-2">New Loan Adjustments</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">New Loan Share (Auto)</label>
                  <div class="text-lg font-semibold text-green-600">{{formatCurrency(newLoanShare())}}</div>
                </div>
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Pay Amount (Auto)</label>
                  <div class="text-lg font-semibold text-green-600">{{formatCurrency(payAmount())}}</div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200" *ngIf="!isGeneralLoan()">
              <h4 class="text-md font-medium text-gray-700 mb-2">Loan Summary</h4>
              <div class="grid grid-cols-1 gap-4">
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Pay Amount (Auto)</label>
                  <div class="text-lg font-semibold text-green-600">{{formatCurrency(payAmount())}}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Surety Tables -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Surety Information
            </h3>
            
            <div class="border rounded-lg overflow-hidden">
              <div class="flex border-b">
                <button type="button" (click)="activeTab='given'" 
                  [class]="'px-4 py-3 font-medium transition-colors ' + (activeTab==='given' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')">
                  Surety Given
                </button>
                <button type="button" (click)="activeTab='taken'" 
                  [class]="'px-4 py-3 font-medium transition-colors ' + (activeTab==='given' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-500 text-white')">
                  Surety Taken
                </button>
              </div>
              
              <div class="bg-white max-h-60 overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MemNo</th>
                      <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr *ngFor="let s of activeTab==='given' ? givenSurety : takenSurety" class="hover:bg-gray-50 transition-colors">
                      <td class="p-3 text-sm text-gray-700">{{s.memNo}}</td>
                      <td class="p-3 text-sm text-gray-700">{{s.name}}</td>
                    </tr>
                    <tr *ngIf="(activeTab==='given' ? givenSurety : takenSurety).length === 0">
                      <td colspan="2" class="p-4 text-center text-sm text-gray-500">No records found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class LoanTakenComponent {
  form: FormGroup;
  canSave = false;
  activeTab: 'given' | 'taken' = 'given';

  // Loan types array
  loanTypes = ['General', 'Emergency', 'Festival', 'LAS', 'LA FDR'];
  
  members = [
    { memNo: 'M001', name: 'Ramesh Kumar', share: 20000, cd: 0, lastSalary: 0, mwf: 0 },
    { memNo: '1017', name: 'AKSHAY CHAUHAN', share: 0, cd: 0, lastSalary: 0, mwf: 0 },
    { memNo: 'M003', name: 'Anita Sharma', share: 15000, cd: 2000, lastSalary: 18000, mwf: 120 }
  ];
  banks = ['State Bank', 'HDFC', 'ICICI', 'Axis Bank'];

  selectedMember: any = null;
  givenSurety: Array<{ memNo: string; name: string }> = [];
  takenSurety: Array<{ memNo: string; name: string }> = [];

  constructor(private fb: FormBuilder) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      loanNo: [this.generateLoanNoStr()],
      loanDate: [today, Validators.required],
      edpNo: [''],
      loanType: ['General', Validators.required],
      member: ['', Validators.required],
      loanAmount: [0, [Validators.required, Validators.min(0)]],
      previousLoan: [0, [Validators.min(0)]],
      installments: [60, [Validators.required, Validators.min(1), Validators.max(60)]],
      purpose: [''],
      authorizedBy: [''],
      paymentMode: ['Cash'],
      bank: [''],
      chequeNo: [''],
      chequeDate: ['']
    });

    // Add custom validator for installments
    this.form.get('installments')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(60),
      (control) => {
        const value = control.value;
        return value && !Number.isInteger(Number(value)) ? { notInteger: true } : null;
      }
    ]);
  }

  // Check if current loan type is General
  isGeneralLoan() {
    return this.form.get('loanType')?.value === 'General';
  }

  generateLoanNoStr() {
    const t = Date.now().toString().slice(-6);
    return `LN-${new Date().getFullYear()}-${t}`;
  }
  
  generateLoanNo() {
    this.form.patchValue({ loanNo: this.generateLoanNoStr() });
  }
  
  openSearch() { alert('Open Loan Search - implement search modal'); }
  
  onClose() { this.onClear(); }
  
  onClear() {
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      loanNo: this.generateLoanNoStr(),
      loanDate: today,
      edpNo: '',
      loanType: 'General',
      member: '',
      loanAmount: 0,
      previousLoan: 0,
      installments: 60,
      purpose: '',
      authorizedBy: '',
      paymentMode: 'Cash',
      bank: '',
      chequeNo: '',
      chequeDate: ''
    });
    this.selectedMember = null;
    this.givenSurety = [];
    this.takenSurety = [];
    this.canSave = false;
  }

  formatCurrency(v: number) {
    return '₹' + (Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  onEdpSelect() {
    const memNo = this.form.get('edpNo')!.value;
    const member = this.members.find(m => m.memNo === memNo);
    if (member) {
      this.selectedMember = member;
      this.form.patchValue({ member: member.name });
    }
  }

  isCheque() { return this.form.get('paymentMode')!.value === 'Cheque'; }
  
  onLoanTypeChange() { 
    this.recalculate(); 
    // Reset purpose validation based on loan type
    if (this.isGeneralLoan()) {
      this.form.get('purpose')?.clearValidators();
    } else {
      this.form.get('purpose')?.setValidators([Validators.required]);
    }
    this.form.get('purpose')?.updateValueAndValidity();
  }
  
  onPaymentModeChange() { }

  get interestRate() { 
    // Different interest rates for different loan types
    switch(this.form.get('loanType')?.value) {
      case 'General': return 0.07;
      case 'Emergency': return 0.09;
      case 'Festival': return 0.08;
      case 'LAS': return 0.075;
      case 'LA FDR': return 0.065;
      default: return 0.07;
    }
  }
  
  netLoan() { 
    return (Number(this.form.get('loanAmount')!.value) || 0) + (Number(this.form.get('previousLoan')!.value) || 0); 
  }
  
  installmentAmount() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const n = Number(this.form.get('installments')!.value) || 1;
    if (n <= 0) return 0;
    return Math.round((((loan * this.interestRate) + loan) / n + Number.EPSILON) * 100) / 100;
  }
  
  newLoanShare() {
    // Only calculate for General loans
    if (!this.isGeneralLoan()) return 0;
    
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const historyShare = this.selectedMember?.share ?? 0;
    const required = loan * 0.1;
    const extra = required > historyShare ? (required - historyShare) : 0;
    return Math.round((extra + Number.EPSILON) * 100) / 100;
  }
  
  payAmount() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const prev = Number(this.form.get('previousLoan')!.value) || 0;
    
    // For General loans, subtract the new share amount
    if (this.isGeneralLoan()) {
      const newShare = this.newLoanShare();
      return Math.round(((loan - prev) - newShare + Number.EPSILON) * 100) / 100;
    }
    
    // For other loan types, just subtract the previous loan
    return Math.round((loan - prev + Number.EPSILON) * 100) / 100;
  }

  enforceLoanRules() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    if (loan < 0) return { ok: false, message: 'Loan amount cannot be negative' };
    
    const installments = Number(this.form.get('installments')!.value) || 0;
    if (!Number.isInteger(installments) || installments <= 0) 
      return { ok: false, message: 'Installments must be a positive integer' };
    
    if (installments > 60) 
      return { ok: false, message: 'Installments cannot exceed 60' };
    
    if (!this.selectedMember) 
      return { ok: false, message: 'Select a valid member' };
    
    // Only apply share-based rules for General loans
    if (this.isGeneralLoan()) {
      const share = this.selectedMember.share || 0;
      const eligibleMax = share * 10;
      if (loan > eligibleMax) {
        const adjustedShare = Math.ceil((loan / 10));
        return { ok: false, message: `Requested loan exceeds max (₹${eligibleMax}). Increase share to ₹${adjustedShare} or reduce loan.` };
      }
    }
    
    // Check purpose is required for non-General loans
    if (!this.isGeneralLoan() && !this.form.get('purpose')?.value) {
      return { ok: false, message: 'Purpose is required for this loan type' };
    }
    
    if (this.isCheque() && !this.form.get('chequeDate')!.value) 
      return { ok: false, message: 'Cheque date required' };
    
    return { ok: true };
  }

  onValidate() {
    const res = this.enforceLoanRules();
    if (!res.ok) { 
      alert(res.message); 
      this.canSave = false; 
      return; 
    }
    alert('Validation successful');
    this.canSave = true;
  }

  onSave() {
    if (!this.canSave) { alert('Please validate before saving'); return; }
    const payload = { 
      ...this.form.value, 
      member: this.selectedMember, 
      netLoan: this.netLoan(), 
      installmentAmount: this.installmentAmount(), 
      newLoanShare: this.newLoanShare(), 
      payAmount: this.payAmount() 
    };
    console.log('Saving Loan Payload', payload);
    alert('Loan saved (mock). Check console for payload.');
    this.canSave = false;
    this.onClear();
  }

  recalculate() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const installments = Number(this.form.get('installments')!.value) || 1;

    if (installments > 0) {
      // Update derived installment amount
      const emi = Math.round((((loan * this.interestRate) + loan) / installments + Number.EPSILON) * 100) / 100;
      // We don't need to patch the value since we're using a function in the template
    }
  }
}