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
  OverallLoanTotal: number;
  InstallmentSum: number;
  InterestSum: number;
  NetDeduction: number;
  PenalInterest: number;
  PenalDeduction: number;
  TotalPayable: number;
  DueDate: string;
}

@Component({
  selector: 'app-demand-process',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <div class="space-y-6">
    <h2 class="text-xl font-bold">Monthly Demand Processing</h2>

    <!-- Demand Table -->
    <div class="border rounded shadow bg-white overflow-auto">
      <div class="p-3 border-b font-semibold">Demand List</div>
      <table class="w-full border-collapse text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-2 py-1">Member No</th>
            <th class="border px-2 py-1">Member Name</th>
            <th class="border px-2 py-1">CD</th>
            <th class="border px-2 py-1">General Loan</th>
            <th class="border px-2 py-1">Gen Installment</th>
            <th class="border px-2 py-1">Gen Interest</th>
            <th class="border px-2 py-1">Emergency Loan</th>
            <th class="border px-2 py-1">E-Installment</th>
            <th class="border px-2 py-1">E-Interest</th>
            <th class="border px-2 py-1">Festival Loan</th>
            <th class="border px-2 py-1">F-Installment</th>
            <th class="border px-2 py-1">F-Interest</th>
            <th class="border px-2 py-1">Net Deduction</th>
            <th class="border px-2 py-1">Penal Int</th>
            <th class="border px-2 py-1">Penal Ded</th>
            <th class="border px-2 py-1">Total Payable</th>
            <th class="border px-2 py-1">Due Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of demandList"
              (click)="loadRow(row)"
              class="cursor-pointer hover:bg-gray-50">
            <td class="border px-2 py-1">{{ row.MemberNo }}</td>
            <td class="border px-2 py-1">{{ row.MemberName }}</td>
            <td class="border px-2 py-1">{{ row.CDAmount }}</td>
            <td class="border px-2 py-1">{{ row["General Loan"] }}</td>
            <td class="border px-2 py-1">{{ row["General LoanInstallment"] }}</td>
            <td class="border px-2 py-1">{{ row["General LoanInterest"] }}</td>
            <td class="border px-2 py-1">{{ row["Emergency Loan"] }}</td>
            <td class="border px-2 py-1">{{ row["Emergency LoanInstallment"] }}</td>
            <td class="border px-2 py-1">{{ row["Emergency LoanInterest"] }}</td>
            <td class="border px-2 py-1">{{ row["Festival Loan"] }}</td>
            <td class="border px-2 py-1">{{ row["Festival LoanInstallment"] }}</td>
            <td class="border px-2 py-1">{{ row["Festival LoanInterest"] }}</td>
            <td class="border px-2 py-1">{{ row.NetDeduction }}</td>
            <td class="border px-2 py-1">{{ row.PenalInterest }}</td>
            <td class="border px-2 py-1">{{ row.PenalDeduction }}</td>
            <td class="border px-2 py-1">{{ row.TotalPayable }}</td>
            <td class="border px-2 py-1">{{ row.DueDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editable Form -->
    <div class="border rounded shadow bg-white mt-6">
      <div class="p-3 border-b font-semibold">Demand Details</div>
      <form [formGroup]="demandForm" class="grid grid-cols-3 gap-4 p-4 text-sm">
        
        <div><label>Member No</label><input formControlName="MemberNo" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Member Name</label><input formControlName="MemberName" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>CD Amount</label><input type="number" formControlName="CDAmount" class="border rounded px-2 py-1 w-full" /></div>
        
        <div><label>General Loan</label><input type="number" formControlName="General Loan" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Gen Installment</label><input type="number" formControlName="General LoanInstallment" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Gen Interest</label><input type="number" formControlName="General LoanInterest" class="border rounded px-2 py-1 w-full" /></div>
        
        <div><label>Emergency Loan</label><input type="number" formControlName="Emergency Loan" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>E-Installment</label><input type="number" formControlName="Emergency LoanInstallment" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>E-Interest</label><input type="number" formControlName="Emergency LoanInterest" class="border rounded px-2 py-1 w-full" /></div>
        
        <div><label>Festival Loan</label><input type="number" formControlName="Festival Loan" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>F-Installment</label><input type="number" formControlName="Festival LoanInstallment" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>F-Interest</label><input type="number" formControlName="Festival LoanInterest" class="border rounded px-2 py-1 w-full" /></div>
        
        <div><label>Net Deduction</label><input type="number" formControlName="NetDeduction" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Penal Int</label><input type="number" formControlName="PenalInterest" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Penal Ded</label><input type="number" formControlName="PenalDeduction" class="border rounded px-2 py-1 w-full" /></div>
        
        <div><label>Total Payable</label><input type="number" formControlName="TotalPayable" class="border rounded px-2 py-1 w-full" /></div>
        <div><label>Due Date</label><input formControlName="DueDate" class="border rounded px-2 py-1 w-full" /></div>
      </form>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2 mt-4">
      <button (click)="save()" class="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
      <button (click)="reset()" class="bg-gray-500 text-white px-4 py-2 rounded">
        Reset
      </button>
    </div>
  </div>
  `
})
export class DemandProcessComponent implements OnInit {
  demandList: Demand[] = [];
  demandForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.demandForm = this.fb.group({
      MemberNo: [''],
      MemberName: [''],
      CDAmount: [0],
      "General Loan": [0],
      "General LoanInstallment": [0],
      "General LoanInterest": [0],
      "Emergency Loan": [0],
      "Emergency LoanInstallment": [0],
      "Emergency LoanInterest": [0],
      "Festival Loan": [0],
      "Festival LoanInstallment": [0],
      "Festival LoanInterest": [0],
      NetDeduction: [0],
      PenalInterest: [0],
      PenalDeduction: [0],
      TotalPayable: [0],
      DueDate: ['']
    });

    // Load JSON data
    this.http.get<{ Demand: Demand[] }>('/assets/demanddata.json')
      .subscribe(data => {
        this.demandList = data.Demand;
      });
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
