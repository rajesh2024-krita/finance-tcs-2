// src/app/components/voucher-creation/voucher-creation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Member, VoucherService, LedgerAccount, BankAccount } from '../../../services/voucher.service';

interface VoucherEntry {
  particulars: string;
  debit: number;
  credit: number;
  particularCode?: string;
  ledgerAccountId?: number;
  memberId?: number;
  type: string;
}

export interface VoucherRequest {
  particularId: number;
  societyId: number;
  voucherType: string;
  voucherDate: string;
  narration: string;
  memberId: number;
  loanId?: number;
  amount: number;
  bankId: number;
  chequeNumber: string;
  chequeDate: string;
}

@Component({
  selector: 'app-voucher-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
  <div class="">
    <form [formGroup]="voucherForm" (ngSubmit)="saveVoucher()">
    <div class="space-y-2">

      <!-- Header -->
      <div class="uppercase text-lg mb-2">Voucher Entry</div>

      <!-- Voucher Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Voucher Type</label>
          <select formControlName="voucherType" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="" selected>-- Select Type --</option>
            <option value="Payment">Payment Voucher</option>
            <option value="Receipt">Receipt Voucher</option>
            <option value="Journal">Journal Voucher</option>
            <option value="Contra">Contra Voucher</option>
          </select>
        </div>
        <!-- <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Voucher No.</label>
          <input type="text" formControlName="voucherNo" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div> -->
        <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Date</label>
          <input type="date" formControlName="voucherDate" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
      </div>

      <!-- Society Bank Selection -->
      <div class="border bg-white p-4">
        <h3 class="font-semibold mb-3">Bank Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Society Bank Account</label>
            <select formControlName="bankAccountId" (change)="onBankAccountChange()" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option value="">-- Select Bank Account --</option>
              <option *ngFor="let bank of bankAccounts" [value]="bank.id">
                {{ bank.bankName }} - {{ bank.accountNumber }}
              </option>
            </select>

          </div>
          <!-- <div>
            <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Selected Loan Type ID</label>
            <input type="text" [value]="selectedLoanTypeId" readonly class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div> -->
        </div>
      </div>

      <!-- Voucher Entries Table -->
      <div class="overflow-x-auto bg-white">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-3 py-2 text-left border">Particulars</th>
              <th class="px-3 py-2 text-right border">Debit</th>
              <th class="px-3 py-2 text-right border">Credit</th>
              <th class="px-3 py-2 text-center border">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of voucherEntries; let i = index">
              <td class="px-3 py-2 border">{{ entry.particulars }}</td>
              <td class="px-3 py-2 border text-right">
                {{ entry.debit > 0 ? (entry.debit | number:'1.2-2') : '-' }}
              </td>
              <td class="px-3 py-2 border text-right">
                {{ entry.credit > 0 ? (entry.credit | number:'1.2-2') : '-' }}
              </td>
              <td class="px-3 py-2 border text-center">
                <button type="button" (click)="removeEntry(i)" class="text-red-600 hover:underline text-sm">Remove</button>
              </td>
            </tr>
            <tr *ngIf="voucherEntries.length === 0">
              <td colspan="4" class="px-3 py-6 text-center text-gray-500">No entries added yet</td>
            </tr>
            <tr *ngIf="voucherEntries.length > 0" class="font-semibold bg-gray-50">
              <td class="px-3 py-2 border">Total</td>
              <td class="px-3 py-2 border text-right">₹{{ getTotalDebit() | number:'1.2-2' }}</td>
              <td class="px-3 py-2 border text-right">₹{{ getTotalCredit() | number:'1.2-2' }}</td>
              <td class="border"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add New Entry Form -->
      <div [formGroup]="entryForm" class="border bg-white p-4">
        <h3 class="font-semibold mb-3">Add New Entry</h3>
        <div class="mb-4">
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Particulars</label>
          <div class="flex gap-2">
            <input type="text" formControlName="particulars" readonly placeholder="Click select button" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            <button type="button" (click)="openParticularsPopup()" class="bg-blue-600 text-white px-4 py-2 rounded-md">Select</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Db/Cr</label>
            <select formControlName="type" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option value="">Select</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Amount</label>
            <input type="number" formControlName="amount" step="0.01" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
          <div class="flex items-end gap-2">
            <button type="button" (click)="addEntry()" class="bg-blue-600 text-white px-4 py-2 rounded-md">Add</button>
            <button type="button" (click)="clearEntry()" class="bg-gray-500 text-white px-4 py-2 rounded-md">Clear</button>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 border bg-white p-4">
        <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Ch No.</label>
          <input type="text" formControlName="chequeNo" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Cheque Date</label>
          <input type="date" formControlName="chequeDate" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        <!-- <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Pass Date</label>
          <input type="date" formControlName="passDate" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div> -->
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border bg-white p-4">
        <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Narration</label>
          <textarea formControlName="narration" rows="3" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
        </div>
        <!-- <div>
          <label  class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Remarks</label>
          <textarea formControlName="remarks" rows="3" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
        </div> -->
      </div>

      <!-- Balance Warning -->
      <!-- <div *ngIf="!isBalanced()" class="bg-red-50 border border-red-200 rounded-md p-3">
        <span class="text-red-700 text-sm font-medium">
          Warning: Debit and Credit totals don't match! Difference: ₹{{ Math.abs(getTotalDebit() - getTotalCredit()) | number:'1.2-2' }}
        </span>
      </div> -->
      <!-- [disabled]="!isBalanced()" -->

      <!-- Footer Buttons -->
      <div class="flex flex-wrap gap-3 justify-end border-t pt-4">
        <!-- <button type="button" (click)="reverseVoucher()" class="bg-orange-500 text-white px-5 py-2 rounded-md">Reverse</button> -->
        <button type="submit"  class="bg-blue-600 text-white px-5 py-2 rounded-md">Save</button>
        <!-- <button type="button" (click)="printVoucher()" class="bg-green-600 text-white px-5 py-2 rounded-md">Print</button> -->
        <!-- <button type="button" (click)="deleteVoucher()" class="bg-red-600 text-white px-5 py-2 rounded-md">Delete</button> -->
        <!-- <button type="button" (click)="newVoucher()" class="bg-purple-600 text-white px-5 py-2 rounded-md">New</button> -->
        <!-- <button type="button" (click)="closeForm()" class="bg-gray-600 text-white px-5 py-2 rounded-md">Close</button> -->
      </div>

    </div>
  </form>
  </div>

  <!-- Particulars Selection Popup -->
  <div *ngIf="showParticularsPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Popup Header -->
      <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h3 class="text-lg font-semibold">Select Particulars</h3>
        <button (click)="closeParticularsPopup()" class="text-white hover:text-gray-200 text-xl">
          &times;
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b">
        <div class="flex">
          <!-- <button 
            [class]="activeTab === 'member' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'"
            class="px-6 py-3 font-medium text-sm focus:outline-none"
            (click)="setActiveTab('member')">
            Members
          </button> -->
          <button 
            [class]="activeTab === 'ledger' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'"
            class="px-6 py-3 font-medium text-sm focus:outline-none"
            (click)="setActiveTab('ledger')">
            Ledger Accounts
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-4 border-b">
        <input 
          type="text" 
          [value]="searchTerm"
          (input)="onSearchInput($event)"
          placeholder="Search {{ activeTab === 'member' ? 'members' : 'ledger accounts' }}..."
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>

      <!-- Content Area -->
      <div class="overflow-auto max-h-96">
        <!-- Members Tab -->
        <div *ngIf="activeTab === 'member'" class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Code</th> -->
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let member of filteredMembers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.name }}</td>
                <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.memberCode }}</td> -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    (click)="selectMember(member)"
                    class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs">
                    Select
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredMembers.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ledger Accounts Tab -->
        <div *ngIf="activeTab === 'ledger'" class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
  <tr>
    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
    <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th> -->
    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
  </tr>
</thead>
<tbody class="bg-white divide-y divide-gray-200">
  <tr *ngFor="let ledger of filteredLedgers" class="hover:bg-gray-50">
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ ledger.ledgerAccountId }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ ledger.accountName }}</td>
    <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ ledger.accountCode }}</td> -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ ledger.memberName }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm">
      <button 
        (click)="selectLedger(ledger)"
        class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs">
        Select
      </button>
    </td>
  </tr>
  <tr *ngIf="filteredLedgers.length === 0">
    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
      No ledger accounts found
    </td>
  </tr>
</tbody>

          </table>
        </div>
      </div>

      <!-- Popup Footer -->
      <div class="bg-gray-50 px-4 py-3 flex justify-end gap-3">
        <button 
          (click)="closeParticularsPopup()"
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </div>
  </div>
  `
})
export class VoucherCreationComponent implements OnInit {
  voucherForm: FormGroup;
  entryForm: FormGroup;
  voucherEntries: VoucherEntry[] = [];
  Math = Math;

  // Data properties
  bankAccounts: BankAccount[] = [];
  selectedLoanTypeId: number | null = null;
  members: Member[] = [];
  ledgerAccounts: LedgerAccount[] = [];
  filteredLedgerAccounts: LedgerAccount[] = [];
  selectedMemberId: number | null = null;

  // Popup properties
  showParticularsPopup = false;
  activeTab: 'ledger' | 'member' = 'ledger';
  searchTerm = '';
  filteredMembers: Member[] = [];
  filteredLedgers: LedgerAccount[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private voucherService: VoucherService
  ) {
    this.voucherForm = this.createVoucherForm();
    this.entryForm = this.createEntryForm();
  }

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.voucherForm.patchValue({
      voucherDate: today,
      chequeDate: today,
      passDate: today
    });

    // Load initial data
    this.loadBankAccounts();
    this.loadMembers();


    // this.loadLedgerAccounts();
    this.loadMembersAndLedgers();
  }

  createVoucherForm(): FormGroup {
    return this.fb.group({
      voucherType: [''],
      voucherNo: [''],
      voucherDate: [''],
      bankAccountId: [''],
      chequeNo: [''],
      chequeDate: [''],
      passDate: [''],
      narration: [''],
      remarks: ['']
    });
  }

  createEntryForm(): FormGroup {
    return this.fb.group({
      type: [''],
      particulars: [''],
      amount: [''],
      ledgerAccountId: [''],
      memberId: ['']
    });
  }

  // Load bank accounts with proper error handling
  loadBankAccounts() {
    this.voucherService.getBanks().subscribe({
      next: (response: any) => {
        // Handle different possible response structures
        if (Array.isArray(response)) {
          this.bankAccounts = response;
        } else if (response && Array.isArray(response.data)) {
          this.bankAccounts = response.data;
        } else if (response && response.result && Array.isArray(response.result)) {
          this.bankAccounts = response.result;
        } else {
          console.warn('Unexpected bank accounts response structure:', response);
          this.bankAccounts = [];
        }
      },
      error: (error: any) => {
        this.snackBar.open('Error loading bank accounts', 'Close', { duration: 3000 });
        console.error('Error loading bank accounts:', error);
        this.bankAccounts = [];
      }
    });
  }

  // Load members with proper error handling
  // loadMembers() {
  //   this.voucherService.getMembers().subscribe({
  //     next: (response: any) => {
  //       // Handle different possible response structures
  //       if (Array.isArray(response)) {
  //         this.members = response;
  //         this.filteredMembers = response;
  //       } else if (response && Array.isArray(response.data)) {
  //         this.members = response.data;
  //         this.filteredMembers = response.data;
  //       } else if (response && response.result && Array.isArray(response.result)) {
  //         this.members = response.result;
  //         this.filteredMembers = response.result;
  //       } else {
  //         console.warn('Unexpected members response structure:', response);
  //         this.members = [];
  //         this.filteredMembers = [];
  //       }
  //     },
  //     error: (error: any) => {
  //       console.error('Error loading members:', error);
  //       this.members = [];
  //       this.filteredMembers = [];
  //     }
  //   });
  // }

  // Load ledger accounts with proper error handling
  ledgerAccountsWithMemberName: (LedgerAccount & { memberName?: string })[] = [];

  loadMembersAndLedgers() {
    this.voucherService.getMembers().subscribe({
      next: (membersResponse: any) => {
        if (Array.isArray(membersResponse)) {
          this.members = membersResponse;
        } else if (membersResponse?.data && Array.isArray(membersResponse.data)) {
          this.members = membersResponse.data;
        } else if (membersResponse?.result && Array.isArray(membersResponse.result)) {
          this.members = membersResponse.result;
        }
        this.filteredMembers = this.members;

        // Now load ledger accounts AFTER members are loaded
        this.loadLedgerAccounts();
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.members = [];
        this.filteredMembers = [];
        // still attempt to load ledgers
        this.loadLedgerAccounts();
      }
    });
  }

  loadLedgerAccounts() {
    // If members are not loaded yet, fetch them first
    const loadLedgers = () => {
      this.voucherService.getLedgers().subscribe({
        next: (response: any) => {
          let ledgers: LedgerAccount[] = [];

          if (Array.isArray(response)) {
            ledgers = response;
          } else if (response?.data && Array.isArray(response.data)) {
            ledgers = response.data;
          } else if (response?.result && Array.isArray(response.result)) {
            ledgers = response.result;
          }

          // Merge member names now that members are loaded
          this.ledgerAccounts = ledgers;
          console.log('this.members == ', this.members)
          console.log('ledgers == ', ledgers)
          this.ledgerAccountsWithMemberName = this.ledgerAccounts.map(ledger => {
            const member = this.members.find(m => m.id === ledger.memberId);
            console.log('member == ', member)
            return {
              ...ledger,
              memberName: member ? member.name : ''
            };
          });
          this.filteredLedgers = this.ledgerAccountsWithMemberName;
          console.log('this.filteredLedgers == ', this.filteredLedgers)
        },
        error: (err) => {
          console.error('Error loading ledger accounts:', err);
          this.ledgerAccounts = [];
          this.filteredLedgers = [];
        }
      });
    };

    if (!this.members || this.members.length === 0) {
      // Load members first
      this.voucherService.getMembers().subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.members = response;
          } else if (response?.data && Array.isArray(response.data)) {
            this.members = response.data;
          } else if (response?.result && Array.isArray(response.result)) {
            this.members = response.result;
          }
          this.filteredMembers = this.members;

          // Now load ledger accounts
          loadLedgers();
        },
        error: (err) => {
          console.error('Error loading members:', err);
          this.members = [];
          this.filteredMembers = [];

          // Still attempt to load ledger accounts without member names
          loadLedgers();
        }
      });
    } else {
      // Members already loaded, directly load ledgers
      loadLedgers();
    }
  }


  // Make sure to call this after members are loaded
  loadMembers() {
    this.voucherService.getMembers().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.members = response;
        } else if (response?.data && Array.isArray(response.data)) {
          this.members = response.data;
        } else if (response?.result && Array.isArray(response.result)) {
          this.members = response.result;
        }

        this.filteredMembers = this.members;

        // Update member names for ledgers
        this.ledgerAccountsWithMemberName = this.ledgerAccounts.map(ledger => {
          const member = this.members.find(m => m.id === ledger.memberId);
          return {
            ...ledger,
            memberName: member ? member.name : ''
          };
        });
        this.filteredLedgers = this.ledgerAccountsWithMemberName;
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.members = [];
        this.filteredMembers = [];
      }
    });
  }


  // onBankAccountChange() {
  //   const bankAccountId = this.voucherForm.get('bankAccountId')?.value;
  //   const selectedBank = this.bankAccounts.find(bank => bank.bankId === bankAccountId);
  //   this.selectedLoanTypeId = selectedBank ? selectedBank.loanTypeId : null;
  // }

  selectedBankId: number | null = null; // add this property

  onBankAccountChange() {
    const bankAccountId = this.voucherForm.get('bankAccountId')?.value;
    const selectedBank = this.bankAccounts.find(bank => bank.id === +bankAccountId);
    this.selectedLoanTypeId = selectedBank ? selectedBank.loanTypeId : null;
    this.selectedBankId = selectedBank ? selectedBank.id : null; // store actual bank.id
    console.log('Selected Bank ID:', this.selectedBankId);
  }



  // Popup Methods
  openParticularsPopup() {
    this.showParticularsPopup = true;
    this.activeTab = 'ledger';
    this.searchTerm = '';
    this.filterData();
  }

  closeParticularsPopup() {
    this.showParticularsPopup = false;
    this.searchTerm = '';
  }

  setActiveTab(tab: 'ledger') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.filterData();
  }

  // Handle search input without formControlName
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.filterData();
  }

  filterData() {
    const term = this.searchTerm.toLowerCase();

    if (this.activeTab === 'member') {
      if (Array.isArray(this.members)) {
        this.filteredMembers = this.members.filter(member =>
          member.name?.toLowerCase().includes(term) ||
          member.memberCode?.toLowerCase().includes(term) ||
          member.id?.toString().includes(term)
        );
      } else {
        this.filteredMembers = [];
      }
    } else {
      if (Array.isArray(this.ledgerAccountsWithMemberName)) {
        // Use ledgerAccountsWithMemberName to include memberName
        this.filteredLedgers = this.ledgerAccountsWithMemberName.filter(ledger =>
          ledger.accountName?.toLowerCase().includes(term) ||
          ledger.accountCode?.toLowerCase().includes(term) ||
          ledger.ledgerAccountId?.toString().includes(term) ||
          ledger.memberName?.toLowerCase().includes(term)   // optional: allow searching by member name
        );
      } else {
        this.filteredLedgers = [];
      }
    }
  }


  selectMember(member: Member) {
    this.entryForm.patchValue({
      particulars: member.name,
      memberId: member.id,
      ledgerAccountId: '' // Clear ledger account if member is selected
    });
    this.selectedMemberId = member.id;
    console.log('this.selectedMemberId == ', this.selectedMemberId)
    this.closeParticularsPopup();
    this.snackBar.open(`Selected member: ${member.name}`, 'Close', { duration: 2000 });
  }

  selectLedger(ledger: LedgerAccount) {
    console.log(ledger)
    this.entryForm.patchValue({
      particulars: ledger.accountName,
      ledgerAccountId: ledger.ledgerAccountId,
      memberId: ledger.memberId // Clear member if ledger is selected
    });
    this.selectedMemberId = null;
    this.closeParticularsPopup();
    this.snackBar.open(`Selected ledger: ${ledger.accountName}`, 'Close', { duration: 2000 });
  }

  addEntry() {
    if (this.entryForm.valid) {
      const formValue = this.entryForm.value;
      const entry: VoucherEntry = {
        particulars: formValue.particulars,
        debit: formValue.type === 'debit' ? parseFloat(formValue.amount) : 0,
        credit: formValue.type === 'credit' ? parseFloat(formValue.amount) : 0,
        ledgerAccountId: formValue.ledgerAccountId,
        memberId: formValue.memberId,
        type: formValue.type
      };
      this.voucherEntries.push(entry);
      this.clearEntry();
      this.snackBar.open('Entry added successfully!', 'Close', { duration: 2000 });
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }

  removeEntry(index: number) {
    this.voucherEntries.splice(index, 1);
    this.snackBar.open('Entry removed', 'Close', { duration: 2000 });
  }

  clearEntry() {
    this.entryForm.patchValue({
      type: '',
      particulars: '',
      amount: '',
      ledgerAccountId: '',
      memberId: ''
    });
    this.selectedMemberId = null;
  }

  getTotalDebit(): number {
    return this.voucherEntries.reduce((sum, entry) => sum + entry.debit, 0);
  }

  getTotalCredit(): number {
    return this.voucherEntries.reduce((sum, entry) => sum + entry.credit, 0);
  }

  isBalanced(): boolean {
    return this.getTotalDebit() === this.getTotalCredit() && this.voucherEntries.length > 0;
  }

  reverseVoucher() {
    this.voucherEntries.forEach(entry => {
      const temp = entry.debit;
      entry.debit = entry.credit;
      entry.credit = temp;
      entry.type = entry.type === 'debit' ? 'credit' : 'debit';
    });
    this.snackBar.open('Voucher entries reversed!', 'Close', { duration: 2000 });
  }

  getLedgerForMember(memberId: number): LedgerAccount | undefined {
    return this.ledgerAccounts.find(ledger => ledger.memberId === memberId);
  }


  saveVoucher() {
    if (this.voucherForm.valid && this.voucherEntries.length > 0) {
      const form = this.voucherForm.value;

      const mainEntry = this.voucherEntries[0];

      const formatToPostgresTimestamptz = (date: string | Date) => {
        const d = new Date(date);
        return d.toISOString(); // e.g., "2025-09-29T14:30:00.000Z"
      };

      const voucherData: any = {
        particularId: mainEntry.ledgerAccountId || 0,
        societyId: 1,
        voucherType: form.voucherType,
        voucherDate: formatToPostgresTimestamptz(form.voucherDate),
        narration: form.narration,
        memberId: mainEntry.memberId || 0,
        loanId: this.selectedLoanTypeId || null,
        amount: this.getTotalDebit(),
        bankId: this.selectedBankId || 0,  // use selectedBankId here
        chequeNumber: Number(form.chequeNo) || null,
        chequeDate: form.chequeDate ? formatToPostgresTimestamptz(form.chequeDate) : null
      };

      console.log('Saving voucher:', voucherData);

      this.voucherService.createVoucher(voucherData).subscribe({
        next: () => {
          this.snackBar.open('Voucher saved successfully!', 'Close', { duration: 3000 });
          this.newVoucher();
        },
        error: (err) => {
          console.error('Error saving voucher:', err);
          this.snackBar.open('Failed to save voucher. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please complete the form and add at least one entry', 'Close', { duration: 3000 });
    }
  }


  printVoucher() {
    window.print();
    this.snackBar.open('Print dialog opened', 'Close', { duration: 2000 });
  }

  deleteVoucher() {
    if (confirm('Are you sure you want to delete this voucher?')) {
      this.newVoucher();
      this.snackBar.open('Voucher deleted', 'Close', { duration: 2000 });
    }
  }

  newVoucher() {
    this.voucherForm.reset();
    this.entryForm.reset();
    this.voucherEntries = [];
    this.selectedLoanTypeId = null;
    this.selectedMemberId = null;

    const today = new Date().toISOString().split('T')[0];
    this.voucherForm.patchValue({
      voucherDate: today,
      chequeDate: today,
      passDate: today
    });
    this.snackBar.open('New voucher form ready', 'Close', { duration: 2000 });
  }

  closeForm() {
    if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      this.snackBar.open('Form closed', 'Close', { duration: 2000 });
    }
  }
}