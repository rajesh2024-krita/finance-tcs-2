import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

interface Member {
  edpNo: number;
  memberName: string;
  shareBalance: number;      // Share account balance
  loans: Loan[];
  emergencyLoans: Loan[];
  lasLoans: Loan[];
  cdPaid?: number;
}

interface Loan {
  principal: number;
  balance: number;
  installment: number;
  annualRate: number;
  startDate: Date;
  paid?: number;
}

interface Demand {
  edpNo: number;
  memberName: string;
  loanAmt: number;
  cd: number;
  loan: number;
  interest: number;        // Main loan interest
  eLoan: number;
  eInterest: number;       // Separate column for emergency loan interest
  netDeduction: number;
  intDue: number;
  pInt: number;
  pDed: number;            // Previous deduction
  las: number;             // LAS Loan
  lasInt: number;          // LAS Interest
  lasIntDue: number;       // LAS Interest Due
  total: number;
}


@Component({
  selector: 'app-demand-process',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <div class="space-y-6">
  <h2 class="text-xl font-bold">Monthly Demand Processing</h2>

  <!-- Year / Month / New -->
  <div class="flex gap-4 items-end">
    <div>
      <label class="block text-sm font-medium">Year</label>
      <input
        type="text"
        [value]="year"
        readonly
        class="border rounded px-2 py-1 w-24"
      />
    </div>

    <div>
      <label class="block text-sm font-medium">Month</label>
      <select
        [(ngModel)]="selectedMonth"
        (change)="calculateDemand()"
        class="border rounded px-2 py-1"
      >
        <option *ngFor="let m of createdMonths" [value]="m">
          {{ getMonthName(m) }}
        </option>
      </select>
    </div>

    <div>
      <button
        (click)="openNewMonthPopup()"
        class="bg-green-600 text-white px-4 py-2 rounded"
      >
        New
      </button>
    </div>
  </div>

  <!-- Demand Table -->
  <div class="border rounded shadow bg-white">
    <div class="p-3 border-b font-semibold">Demand List</div>
    <table class="w-full border-collapse">
      <thead class="bg-gray-100 text-sm">
  <tr>
    <th class="border px-2 py-1">EDP No</th>
    <th class="border px-2 py-1">Member Name</th>
    <th class="border px-2 py-1">Loan Amt</th>
    <th class="border px-2 py-1">CD</th>
    <th class="border px-2 py-1">Loan</th>
    <th class="border px-2 py-1">Interest</th>
    <th class="border px-2 py-1">E-Loan</th>
    <th class="border px-2 py-1">E-Interest</th>
    <th class="border px-2 py-1">Net Deduction</th>
    <th class="border px-2 py-1">Int Due</th>
    <th class="border px-2 py-1">P Int</th>
    <th class="border px-2 py-1">P Ded</th>
    <th class="border px-2 py-1">LAS</th>
    <th class="border px-2 py-1">LAS Int</th>
    <th class="border px-2 py-1">LAS Int Due</th>
    <th class="border px-2 py-1">Total</th>
  </tr>
</thead>
<tbody>
  <tr *ngFor="let row of demandList" (click)="loadRow(row)" class="cursor-pointer hover:bg-gray-50 text-sm">
    <td class="border px-2 py-1">{{ row.edpNo }}</td>
    <td class="border px-2 py-1">{{ row.memberName }}</td>
    <td class="border px-2 py-1">{{ row.loanAmt }}</td>
    <td class="border px-2 py-1">{{ row.cd }}</td>
    <td class="border px-2 py-1">{{ row.loan }}</td>
    <td class="border px-2 py-1">{{ row.interest }}</td>
    <td class="border px-2 py-1">{{ row.eLoan }}</td>
    <td class="border px-2 py-1">{{ row.eInterest }}</td>
    <td class="border px-2 py-1">{{ row.netDeduction }}</td>
    <td class="border px-2 py-1">{{ row.intDue }}</td>
    <td class="border px-2 py-1">{{ row.pInt }}</td>
    <td class="border px-2 py-1">{{ row.pDed }}</td>
    <td class="border px-2 py-1">{{ row.las }}</td>
    <td class="border px-2 py-1">{{ row.lasInt }}</td>
    <td class="border px-2 py-1">{{ row.lasIntDue }}</td>
    <td class="border px-2 py-1">{{ row.total }}</td>
  </tr>
</tbody>

    </table>
  </div>

  <!-- Editable Form -->
  <div class="border rounded shadow bg-white">
    <div class="p-3 border-b font-semibold">Demand Details</div>
    <form [formGroup]="demandForm" class="grid grid-cols-2 gap-4 p-4">
      <div>
        <label class="block text-sm font-medium">EDP No</label>
        <input formControlName="edpNo" class="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium">Name</label>
        <input
          formControlName="memberName"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Loan Amt</label>
        <input
          type="number"
          formControlName="loanAmt"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">CD</label>
        <input
          type="number"
          formControlName="cd"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Loan</label>
        <input
          type="number"
          formControlName="loan"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Interest</label>
        <input
          type="number"
          formControlName="interest"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">E-Loan</label>
        <input
          type="number"
          formControlName="eLoan"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Net</label>
        <input
          type="number"
          formControlName="net"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Int Due</label>
        <input
          type="number"
          formControlName="intDue"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">P Int</label>
        <input
          type="number"
          formControlName="pInt"
          class="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
  <label class="block text-sm font-medium">E-Interest</label>
  <input type="number" formControlName="eInterest" class="border rounded px-2 py-1 w-full" />
</div>
<div>
  <label class="block text-sm font-medium">P Ded</label>
  <input type="number" formControlName="pDed" class="border rounded px-2 py-1 w-full" />
</div>
<div>
  <label class="block text-sm font-medium">LAS</label>
  <input type="number" formControlName="las" class="border rounded px-2 py-1 w-full" />
</div>
<div>
  <label class="block text-sm font-medium">LAS Int</label>
  <input type="number" formControlName="lasInt" class="border rounded px-2 py-1 w-full" />
</div>
<div>
  <label class="block text-sm font-medium">LAS Int Due</label>
  <input type="number" formControlName="lasIntDue" class="border rounded px-2 py-1 w-full" />
</div>
<div>
  <label class="block text-sm font-medium">Total</label>
  <input type="number" formControlName="total" class="border rounded px-2 py-1 w-full" />
</div>

    </form>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-2">
    <button
      (click)="save()"
      class="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Save
    </button>
    <button
      (click)="reset()"
      class="bg-gray-500 text-white px-4 py-2 rounded"
    >
      Reset
    </button>
  </div>

  <!-- Popup -->
  <div
    *ngIf="showPopup"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h3 class="text-lg font-semibold mb-4">Create New Month</h3>
      <p>
        New month to create:
        <strong>{{ getMonthName(newMonth) }} {{ year }}</strong>
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <button
          (click)="confirmNewMonth()"
          class="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Confirm
        </button>
        <button
          (click)="closePopup()"
          class="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

  `
})
export class DemandProcessComponent implements OnInit {
  year = 2025;
  months = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' }, { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' }, { value: 5, name: 'May' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Aug' }, { value: 9, name: 'Sep' },
    { value: 10, name: 'Oct' }, { value: 11, name: 'Nov' }, { value: 12, name: 'Dec' }
  ];

  lastProcessedMonth = 9;
  selectedMonth: number | null = null;
  createdMonths: number[] = [9];

  showPopup = false;
  newMonth: number | null = null;

  demandList: Demand[] = [];
  demandForm!: FormGroup;

  // 🔹 Configurable society rules
  shareLimit = 500;
  monthlyCD = 150;
  penalRate = 0.02; // 2%

  // 🔹 Mock members + loans
  members: Member[] = [
    {
      edpNo: 101,
      memberName: 'Ravi',
      shareBalance: 300,
      loans: [{ principal: 5000, balance: 5000, installment: 3000, annualRate: 12, startDate: new Date(2025, 8, 12) }], // Sep
      emergencyLoans: [],
      lasLoans: []
    },
    {
      edpNo: 102,
      memberName: 'Anita',
      shareBalance: 600,
      loans: [{ principal: 10000, balance: 10000, installment: 7000, annualRate: 12, startDate: new Date(2025, 8, 1) }],
      emergencyLoans: [{ principal: 2000, balance: 2000, installment: 1000, annualRate: 14, startDate: new Date(2025, 8, 10) }],
      lasLoans: []
    }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.demandForm = this.fb.group({
      edpNo: [''],
      memberName: [''],
      loanAmt: [0],
      cd: [0],
      loan: [0],
      interest: [0],
      eLoan: [0],
      eInterest: [0],
      netDeduction: [0],
      intDue: [0],
      pInt: [0],
      pDed: [0],
      las: [0],
      lasInt: [0],
      lasIntDue: [0],
      total: [0]
    });


    this.selectedMonth = this.createdMonths[0];
    this.calculateDemand();
  }

  // 🔹 Core Calculation
  calculateDemand() {
    const month = this.selectedMonth!;
    const daysInMonth = new Date(this.year, month, 0).getDate();

    this.demandList = this.members.map(member => {
      let cd = this.monthlyCD;

      // Share adjustment
      let shareAdj = 0;
      if (member.shareBalance < this.shareLimit) {
        shareAdj = this.shareLimit - member.shareBalance;
      }

      // Loan processing
      let loanInstall = 0, loanInterest = 0, loanAmt = 0;
      member.loans.forEach(loan => {
        const daysUsed = daysInMonth - loan.startDate.getDate() + 1;
        const interest = loan.balance * (loan.annualRate / 60 / 100) * (daysUsed / daysInMonth);
        let installment = Math.min(loan.installment, loan.balance);
        loan.balance -= installment;
        loanAmt += loan.balance;
        loanInstall += installment;
        loanInterest += interest;
      });

      // Emergency Loan
      let eLoanInstall = 0, eLoanInterest = 0;
      member.emergencyLoans.forEach(loan => {
        const daysUsed = daysInMonth - loan.startDate.getDate() + 1;
        const interest = loan.balance * (loan.annualRate / 12 / 100) * (daysUsed / daysInMonth);
        let installment = Math.min(loan.installment, loan.balance);
        loan.balance -= installment;
        eLoanInstall += installment;
        eLoanInterest += interest;
      });

      // LAS Loan (future expansion, keeping placeholders)
      let lasInstall = 0, lasInterest = 0, lasIntDue = 0;

      // Penal interest + previous deduction (mocked)
      let prevDue = 500;
      let prevPaid = 300;
      let pInt = (prevDue - prevPaid) * this.penalRate;
      let pDed = prevPaid;

      // Net deduction
      const netDeduction = shareAdj + cd + loanInstall + loanInterest + eLoanInstall + eLoanInterest + pInt + pDed + lasInstall + lasInterest;

      // Total (sum of all amounts)
      const total = loanInstall + loanInterest + eLoanInstall + eLoanInterest + lasInstall + lasInterest + cd + shareAdj + pDed + pInt;

      return {
        edpNo: member.edpNo,
        memberName: member.memberName,
        loanAmt,
        cd: cd + shareAdj,
        loan: loanInstall,
        interest: parseFloat(loanInterest.toFixed(2)),
        eLoan: eLoanInstall,
        eInterest: parseFloat(eLoanInterest.toFixed(2)),
        netDeduction: parseFloat(netDeduction.toFixed(2)),
        intDue: 0, // placeholder
        pInt: parseFloat(pInt.toFixed(2)),
        pDed,
        las: lasInstall,
        lasInt: parseFloat(lasInterest.toFixed(2)),
        lasIntDue,
        total: parseFloat(total.toFixed(2))
      } as Demand;
    });
  }


  openNewMonthPopup() {
    const nextMonth = this.lastProcessedMonth + 1;
    if (nextMonth > 12) {
      alert('Year completed, cannot create new month.');
      return;
    }
    if (this.createdMonths.includes(nextMonth)) {
      alert(`Month ${this.getMonthName(nextMonth)} ${this.year} already created!`);
      return;
    }
    this.newMonth = nextMonth;
    this.showPopup = true;
  }

  confirmNewMonth() {
    if (!this.newMonth) return;
    this.selectedMonth = this.newMonth;
    this.lastProcessedMonth = this.newMonth;
    this.createdMonths.push(this.newMonth);
    this.showPopup = false;
    this.calculateDemand();
    alert(`New Month Created: ${this.getMonthName(this.newMonth)} ${this.year}`);
  }

  closePopup() {
    this.showPopup = false;
  }

  getMonthName(value: number | null) {
    return this.months.find(m => m.value === value)?.name || '';
  }

  loadRow(row: Demand) {
    this.demandForm.patchValue(row);
  }

  save() {
    console.log('Saved:', this.demandForm.value);
  }

  reset() {
    this.demandForm.reset();
  }
}
