import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Demand {
  MemberNo: string;
  MemberName: string;
  CDAmount: number;
  "General Loan": number;
  "General LoanInstallment": number;
  "General LoanInterest": number;
  "Emergency Loan": number;
  "Emergency LoanInstallment": number;
  "Emergency LoanInterest": number;
  "Festival Loan": number;
  "Festival LoanInstallment": number;
  "Festival LoanInterest": number;
  NetDeduction: number;
  PenalInterest: number;
  PenalDeduction: number;
  TotalPayable: number;
  DueDate: string;
}

interface MonthlyDemand {
  id: number;
  month: number;
  year: number;
  data: { Demand: Demand[] };
}

@Component({
  selector: 'app-demand-process',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="space-y-3 bg-gray-50 min-h-screen">

  <!-- 🔹 Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold text-gray-800">Monthly Demand Processing</h2>

  </div>

  <!-- 🔹 Month-Year Selection -->
  <div class="bg-white p-4 flex gap-6 items-end border">
    <div class="flex flex-col">
      <label class="text-sm font-medium text-gray-600">Year</label>
      <select [(ngModel)]="selectedYear" (change)="onMonthYearChange()"
        class="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200">
        <option *ngFor="let y of createdYears" [ngValue]="y">{{ y }}</option>
      </select>
    </div>
    <div class="flex flex-col">
      <label class="text-sm font-medium text-gray-600">Month</label>
      <select [(ngModel)]="selectedMonth" (change)="onMonthYearChange()"
        class="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200">
        <option *ngFor="let m of createdMonths" [ngValue]="m">{{ months[m - 1] }}</option>
      </select>
    </div>
    <div>
          <button (click)="addNewMonth()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
      + New Month
    </button>
    </div>
  </div>

  <!-- 🔹 Demand Table -->
  <div class="bg-white overflow-hidden">
    <!-- <div class="p-3 border-b font-semibold text-gray-700 bg-gray-50">Demand List</div> -->
    <div class="overflow-x-auto max-h-[400px]">
      <table class="w-full border-collapse text-xs uppercase bg-white border">
        <thead class=" bg-white">
          <tr>
            <th *ngFor="let col of tableHeaders" class="border-b px-8 py-2 text-left">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of demandList" 
              (click)="loadRow(row)" 
              class="cursor-pointer hover:bg-blue-50 transition">
            <td class="border-b px-3 py-2">{{ row.MemberNo }}</td>
            <td class="border-b px-3 py-2">{{ row.MemberName }}</td>
            <td class="border-b px-3 py-2">{{ row.CDAmount }}</td>
            <td class="border-b px-3 py-2">{{ row["General Loan"] }}</td>
            <td class="border-b px-3 py-2">{{ row["General LoanInstallment"] }}</td>
            <td class="border-b px-3 py-2">{{ row["General LoanInterest"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Emergency Loan"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Emergency LoanInstallment"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Emergency LoanInterest"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Festival Loan"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Festival LoanInstallment"] }}</td>
            <td class="border-b px-3 py-2">{{ row["Festival LoanInterest"] }}</td>
            <td class="border-b px-3 py-2">{{ row.NetDeduction }}</td>
            <td class="border-b px-3 py-2">{{ row.PenalInterest }}</td>
            <td class="border-b px-3 py-2">{{ row.PenalDeduction }}</td>
            <td class="border-b px-3 py-2">{{ row.TotalPayable }}</td>
            <td class="border-b px-3 py-2">{{ row.DueDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 🔹 Editable Form -->
  <div class="bg-white">
    <!-- <div class="p-3 font-semibold text-gray-700 bg-gray-50">Edit Demand Details</div> -->
    <form [formGroup]="demandForm" class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-sm border">
      <ng-container *ngFor="let key of formKeys">
        <div>
          <label class="text-xs font-medium text-gray-500">{{ key }}</label>
          <input [type]="isNumberField(key) ? 'number' : 'text'" formControlName="{{key}}" 
            class="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-200" />
        </div>
      </ng-container>
    </form>
  </div>

  <!-- 🔹 Action Buttons -->
  <div class="flex gap-3">
    <button (click)="save()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow">
      Save
    </button>
    <button (click)="reset()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow">
      Reset
    </button>
  </div>

</div>
  `
})
export class DemandProcessComponent implements OnInit {
  demandList: Demand[] = [];
  demandForm!: FormGroup;
  allDemands: MonthlyDemand[] = [];

  createdMonths: number[] = [];
  createdYears: number[] = [];
  selectedMonth!: number;
  selectedYear!: number;

  months: string[] = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // Table Headers
  tableHeaders: string[] = [
    "Member No","Member Name","CD","General Loan","Gen Installment","Gen Interest",
    "Emergency Loan","E-Installment","E-Interest",
    "Festival Loan","F-Installment","F-Interest",
    "Net Deduction","Penal Int","Penal Ded","Total Payable","Due Date"
  ];

  formKeys: string[] = [
    "MemberNo","MemberName","CDAmount","General Loan","General LoanInstallment",
    "General LoanInterest","Emergency Loan","Emergency LoanInstallment","Emergency LoanInterest",
    "Festival Loan","Festival LoanInstallment","Festival LoanInterest","NetDeduction",
    "PenalInterest","PenalDeduction","TotalPayable","DueDate"
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.demandForm = this.fb.group(Object.fromEntries(this.formKeys.map(k => [k, ['']])));
    this.http.get<any>('/assets/demanddata.json').subscribe((json) => {
      this.allDemands = json.data;
      this.createdMonths = [...new Set(this.allDemands.map(d => d.month))].sort((a, b) => a - b);
      this.createdYears = [...new Set(this.allDemands.map(d => d.year))].sort((a, b) => a - b);
      this.selectedMonth = this.createdMonths[0];
      this.selectedYear = this.createdYears[0];
      this.updateDemandList();
    });
  }

  updateDemandList() {
    const filtered = this.allDemands.find(d => d.month === this.selectedMonth && d.year === this.selectedYear);
    this.demandList = filtered ? filtered.data.Demand : [];
  }

  onMonthYearChange() { this.updateDemandList(); }

  loadRow(row: Demand) { this.demandForm.patchValue(row); }

  save() { console.log('Saved:', this.demandForm.value); alert('Saved in console.'); }

  reset() { this.demandForm.reset(); }

  addNewMonth() {
    let newMonth = this.selectedMonth + 1;
    let newYear = this.selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    if (this.allDemands.some(d => d.month === newMonth && d.year === newYear)) {
      alert('Demand already exists!'); return;
    }
    this.allDemands.push({ id: this.allDemands.length + 1, month: newMonth, year: newYear, data: { Demand: [] } });
    if (!this.createdMonths.includes(newMonth)) this.createdMonths.push(newMonth);
    if (!this.createdYears.includes(newYear)) this.createdYears.push(newYear);
    this.selectedMonth = newMonth; this.selectedYear = newYear;
    this.updateDemandList();
  }

  isNumberField(key: string): boolean {
    return !["MemberNo","MemberName","DueDate"].includes(key);
  }
}
