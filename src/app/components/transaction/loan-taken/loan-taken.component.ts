import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-loan-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="bg-white border">
    <div class="flex justify-between items-center p-6 bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
      <h2 class="text-2xl font-semibold">Loan Entry Form</h2>
      <div class="space-x-2">
        <button (click)="onValidate()" class="px-3 py-1 rounded bg-amber-500 text-white">Validate</button>
        <button (click)="onSave()" [disabled]="!canSave" class="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50">Save</button>
        <button (click)="onClear()" class="px-3 py-1 rounded border">Clear</button>
        <!-- <button (click)="onClose()" class="px-3 py-1 rounded border">Close</button> -->
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4 p-6">
      <div>
          <label class="block text-sm font-medium">Loan Type</label>
          <select formControlName="loanType" (change)="onLoanTypeChange()" class="mt-1 p-2 border rounded w-full">
            <option value="General">General</option>
            <option value="Custom">Custom Loan</option>
          </select>
          <div *ngIf="isCustom()" class="mt-2">
            <label class="block text-xs font-medium">Custom Type</label>
            <select formControlName="customType" class="mt-1 p-2 border rounded w-full">
              <option value="Emergency">Emergency</option>
              <option value="Festival">Festival</option>
              <option value="LAS">LAS</option>
              <option value="LA FDR">LA FDR</option>
            </select>
          </div>
        </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 mb-2">
            <div>
              <label class="block text-sm font-medium">Loan No.</label>
              <div class="flex-cols items-center gap-2 space-x-2 space-y-2">
                <input formControlName="loanNo" class="mt-1 p-2 border rounded w-full" />
                <!-- <button type="button" (click)="generateLoanNo()" class="px-2 py-1 rounded bg-slate-200">New</button> -->
                <!-- <button type="button" (click)="openSearch()" class="px-2 py-1 rounded bg-slate-200">Search</button> -->
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium">Loan Date</label>
              <input type="date" formControlName="loanDate" class="mt-1 p-2 border rounded w-full" />
            </div>

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label class="block text-sm font-medium">EDP No.</label>
              <select formControlName="edpNo" (change)="onEdpSelect()" class="mt-1 p-2 border rounded w-full">
                <option value="">-- Select Member --</option>
                <option *ngFor="let m of members" [value]="m.memNo">{{ m.memNo }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium">Name (member)</label>
              <input formControlName="member" readonly class="mt-1 p-2 border rounded w-full bg-slate-50" />
            </div>

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Loan Amount (₹)</label>
              <input type="number" formControlName="loanAmount" (input)="recalculate()" class="mt-1 p-2 border rounded w-full" />
            </div>

            
            <div>
              <label class="block text-sm font-medium">Previous Loan (Remaining)</label>
              <input type="number" formControlName="previousLoan" class="mt-1 p-2 border rounded w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium">Net Loan (Auto)</label>
              <input [value]="formatCurrency(netLoan())" readonly class="mt-1 p-2 border rounded w-full bg-slate-50" />
            </div>

            <div>
              <label class="block text-sm font-medium">No. of Installments</label>
              <input type="number" formControlName="installments" (input)="recalculate()" class="mt-1 p-2 border rounded w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium">Installment Amount (Auto)</label>
              <input [value]="formatCurrency(installmentAmount())" readonly class="mt-1 p-2 border rounded w-full bg-slate-50" />
            </div>

            <div class="sr-only">
              <label class="block text-sm font-medium">Interest Rate (Auto)</label>
              <input [value]="(interestRate*100).toFixed(2) + '%'" readonly class="mt-1 p-2 border rounded w-full bg-slate-50" />
            </div>

            <div>
              <label class="block text-sm font-medium">Purpose</label>
              <textarea formControlName="purpose" rows="2" class="mt-1 p-2 border rounded w-full"></textarea>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium">Authorized By</label>
              <input formControlName="authorizedBy" class="mt-1 p-2 border rounded w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium">Payment Mode</label>
              <div class="mt-1 flex gap-3 items-center">
                <label class="flex items-center gap-2"><input type="radio" formControlName="paymentMode" value="Cash" (change)="onPaymentModeChange()" /> Cash</label>
                <label class="flex items-center gap-2"><input type="radio" formControlName="paymentMode" value="Cheque" (change)="onPaymentModeChange()" /> Cheque</label>
                <label class="flex items-center gap-2"><input type="radio" formControlName="paymentMode" value="Opening" (change)="onPaymentModeChange()" /> Opening</label>
              </div>
            </div>

            <div *ngIf="isCheque()">
              <label class="block text-sm font-medium">Bank</label>
              <select formControlName="bank" class="mt-1 p-2 border rounded w-full">
                <option value="">-- Select Bank --</option>
                <option *ngFor="let b of banks" [value]="b">{{b}}</option>
              </select>
              <label class="block text-sm font-medium mt-2">Cheque No.</label>
              <input formControlName="chequeNo" class="mt-1 p-2 border rounded w-full" />
              <label class="block text-sm font-medium mt-2">Cheque Date</label>
              <input type="date" formControlName="chequeDate" class="mt-1 p-2 border rounded w-full" />
            </div>
          </div>
        </div>

        <!-- Pay amount dedection -->
        <div>
          <div class="">
            <h3 class="font-semibold mb-2">Member History</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs">Share</label>
                <input [value]="formatCurrency(selectedMember?.share ?? 0)" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs">CD</label>
                <input [value]="formatCurrency(selectedMember?.cd ?? 0)" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs">Last Salary</label>
                <input [value]="formatCurrency(selectedMember?.lastSalary ?? 0)" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs">MWF</label>
                <input [value]="selectedMember?.mwf ?? 0" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <h3 class="font-semibold mb-2">New Loan Adjustments</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs">New Loan Share (Auto)</label>
                <input [value]="formatCurrency(newLoanShare())" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
              <div>
                <label class="block text-xs">Pay Amount (Auto)</label>
                <input [value]="formatCurrency(payAmount())" readonly class="p-2 border rounded w-full bg-slate-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Surity Tabs -->
      <div class="border-t pt-4">
        <h3 class="font-semibold mb-2">Surity Tables</h3>
        <div>
          <div class="flex border-b mb-2">
            <button type="button" (click)="activeTab='given'" [class.border-b-2]="activeTab==='given'" [class.font-bold]="activeTab==='given'" class="px-4 py-2">Given Surity</button>
            <button type="button" (click)="activeTab='taken'" [class.border-b-2]="activeTab==='taken'" [class.font-bold]="activeTab==='taken'" class="px-4 py-2">Taken Surity</button>
          </div>
          <div *ngIf="activeTab==='given'">
            <table class="w-full mt-2 border">
              <thead class="bg-slate-50"><tr><th class="p-2">MemNo</th><th class="p-2">Name</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of givenSurity"><td class="p-2">{{s.memNo}}</td><td class="p-2">{{s.name}}</td></tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="activeTab==='taken'">
            <table class="w-full mt-2 border">
              <thead class="bg-slate-50"><tr><th class="p-2">MemNo</th><th class="p-2">Name</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of takenSurity"><td class="p-2">{{s.memNo}}</td><td class="p-2">{{s.name}}</td></tr>
              </tbody>
            </table>
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

  members = [
    { memNo: 'M001', name: 'Ramesh Kumar', share: 20000, cd: 5000, lastSalary: 25000, mwf: 150 },
    { memNo: 'M002', name: 'Suresh Patel', share: 50000, cd: 10000, lastSalary: 40000, mwf: 200 },
    { memNo: 'M003', name: 'Anita Sharma', share: 15000, cd: 2000, lastSalary: 18000, mwf: 120 }
  ];
  banks = ['State Bank', 'HDFC', 'ICICI', 'Axis Bank'];

  selectedMember: any = null;
  givenSurity: Array<{ memNo: string; name: string }> = [];
  takenSurity: Array<{ memNo: string; name: string }> = [];

  constructor(private fb: FormBuilder) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      loanNo: [this.generateLoanNoStr()],
      loanDate: [today, Validators.required],
      edpNo: [''],
      loanType: ['General', Validators.required],
      customType: ['Emergency'],
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
      customType: 'Emergency',
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
    this.givenSurity = [];
    this.takenSurity = [];
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

  isCustom() { return this.form.get('loanType')!.value === 'Custom'; }
  isCheque() { return this.form.get('paymentMode')!.value === 'Cheque'; }
  onLoanTypeChange() { this.recalculate(); }
  onPaymentModeChange() { }

  get interestRate() { return this.isCustom() ? 0.09 : 0.07; }
  netLoan() { return (Number(this.form.get('loanAmount')!.value) || 0) + (Number(this.form.get('previousLoan')!.value) || 0); }
  installmentAmount() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const n = Number(this.form.get('installments')!.value) || 1;
    if (n <= 0) return 0;
    return Math.round((((loan * this.interestRate) + loan) / n + Number.EPSILON) * 100) / 100;
  }
  newLoanShare() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const historyShare = this.selectedMember?.share ?? 0;
    const required = loan * 0.1;
    const extra = required > historyShare ? (required - historyShare) : 0;
    return Math.round((extra + Number.EPSILON) * 100) / 100;
  }
  payAmount() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const prev = Number(this.form.get('previousLoan')!.value) || 0;
    const newShare = this.newLoanShare();
    return Math.round(((loan - prev) - newShare + Number.EPSILON) * 100) / 100;
  }

  enforceLoanRules() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    if (loan < 0) return { ok: false, message: 'Loan amount cannot be negative' };
    const installments = Number(this.form.get('installments')!.value) || 0;
    if (!Number.isInteger(installments) || installments <= 0) return { ok: false, message: 'Installments must be positive' };
    if (installments > 60) return { ok: false, message: 'Installments cannot exceed 60' };
    if (!this.selectedMember) return { ok: false, message: 'Select a valid member' };
    if (!this.isCustom()) {
      const share = this.selectedMember.share || 0;
      const eligibleMax = share * 10;
      if (loan > eligibleMax) {
        const adjustedShare = Math.ceil((loan / 10));
        return { ok: false, message: `Requested loan exceeds max (₹${eligibleMax}). Increase share to ₹${adjustedShare} or reduce loan.` };
      }
    }
    if (this.isCheque() && !this.form.get('chequeDate')!.value) return { ok: false, message: 'Cheque date required' };
    return { ok: true };
  }

  onValidate() {
    const res = this.enforceLoanRules();
    if (!res.ok) { alert(res.message); this.canSave = false; return; }
    alert('Validation successful');
    this.canSave = true;
  }

  onSave() {
    if (!this.canSave) { alert('Please validate before saving'); return; }
    const payload = { ...this.form.value, member: this.selectedMember, netLoan: this.netLoan(), installmentAmount: this.installmentAmount(), newLoanShare: this.newLoanShare(), payAmount: this.payAmount() };
    console.log('Saving Loan Payload', payload);
    alert('Loan saved (mock). Check console for payload.');
    this.canSave = false;
    this.onClear();
  }

  recalculate() { }
}
