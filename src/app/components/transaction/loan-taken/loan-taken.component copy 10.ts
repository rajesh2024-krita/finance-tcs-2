import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { LoanTakenService, MemberDto, LoanTakenCreateDto, SocietyLimitDto, Member } from '../../../services/loan-taken.service';
import { max } from 'rxjs';

@Component({
  selector: 'app-loan-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="">
      <!-- Header Section -->
      <div class="">
        <div class="uppercase text-lg mb-2">Loan Entry</div>
      </div>

      <!-- Form Content -->
      <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-6">
        <!-- Loan Type Section -->
        <div class="bg-white p-4 border">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Loan Type</label>
              <select formControlName="loanType" (change)="onLoanTypeChange()" 
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option *ngFor="let type of loanTypes" [value]="type.LoanType">{{type.LoanType}}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loan Details Section -->
        <div class="bg-white p-4 border">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Loan Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-white border">
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Loan No.</label>
              <div class="flex items-center gap-2">
                <input formControlName="loanNo" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                <button type="button" (click)="generateLoanNo()" class="w-1/3 px-3 py-2 bg-[#4f46e4] text-white rounded text-xs">
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Loan Date</label>
              <input type="date" formControlName="loanDate" 
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">EDP No.</label>
              <div class="flex items-center gap-2">
                <!-- Member Number Input -->
                <input 
                  type="text" 
                  formControlName="edpNo" 
                  placeholder="Enter Member No" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs 
                        focus:ring-blue-500 focus:border-blue-500 
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                        dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  readonly
                />

                <!-- Browse Button -->
                <button 
                  type="button" 
                  (click)="openMemberPopup()" 
                  class="px-3 py-2 bg-[#4f46e4] text-white rounded text-xs w-1/3">
                  Select member
                </button>
              </div>

            </div>
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name (member)</label>
              <input formControlName="memberName" readonly 
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Loan Amount (₹)</label>
              <input type="number" formControlName="loanAmount" (input)="recalculate()" 
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>
            
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Previous Loan (Remaining)</label>
              <input type="number" formControlName="previousLoan" (input)="recalculate()"
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>
          </div>
        </div>

        <!-- Loan Calculation Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="bg-white p-4 border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Loan Calculations
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Net Loan (Auto)</label>
                <input [value]="formatCurrency(netLoan())" readonly 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>

              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                  No. of Installments
                </label>
                <input
                  type="number"
                  formControlName="installments"
                  (input)="recalculate()"
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />

                <!-- Error Message -->
                <p *ngIf="form.get('installments')?.errors?.['max'] && form.get('installments')?.touched"
                  class="text-red-500 text-sm mt-1">
                  Maximum allowed installments is 60
                </p>
              </div>

              
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Installment Amount (Auto)</label>
                <input 
  [value]="isValidated ? formatCurrency(installmentAmount()) : ''" 
  readonly
  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs 
         focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
         dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />

              </div>

              <div class="sr-only">
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Interest Rate (Auto)</label>
                <input [value]="(interestRate*100).toFixed(2) + '%'" readonly 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="bg-white p-4 border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Additional Information
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Purpose</label>
                <textarea formControlName="purpose" rows="4" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
              </div>
              
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                  Authorized By <span class="text-xs text-gray-500">(In the case of Limit Exceed)</span>
                </label>
                <input formControlName="authorizedBy" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- Member Information Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column: Member History -->
          <div class="bg-white p-4 border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Member History
            </h3>
            
            <div class="grid grid-cols-1 gap-4">
              <div class="bg-white p-3 rounded-lg border">
                <label class="block text-xs font-medium text-gray-500 mb-1">Share</label>
                <div class="text-lg font-semibold" [class.text-blue-700]="getShareValue(selectedMember) >= 0"
  [class.text-red-600]="getShareValue(selectedMember) < 0">
                  {{formatCurrency(getShareValue(selectedMember))}}
                </div>
              </div>
            </div>

            <!-- In member history section, add validation status -->
            <div class="mt-4 pt-4 border-t border-gray-200" *ngIf="isGeneralLoan()">
              <h4 class="text-md font-medium text-gray-700 mb-2">New Loan Adjustments</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">New Loan Share (Auto)</label>
                  <div class="text-lg font-semibold" [class.text-green-600]="isValidated" [class.text-gray-400]="!isValidated">
                    {{isValidated ? formatCurrency(validatedNewLoanShare) : 'Validate to calculate'}}
                  </div>
                </div>
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Pay Amount (Auto)</label>
                  <div class="text-lg font-semibold" [class.text-green-600]="isValidated" [class.text-gray-400]="!isValidated">
                    {{isValidated ? formatCurrency(validatedPayAmount) : 'Validate to calculate'}}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200" *ngIf="!isGeneralLoan()">
              <h4 class="text-md font-medium text-gray-700 mb-2">Loan Summary</h4>
              <div class="grid grid-cols-1 gap-4">
                <div class="bg-white p-3 rounded-lg border">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Pay Amount (Auto)</label>
                  <div class="text-lg font-semibold" [class.text-green-600]="isValidated" [class.text-gray-400]="!isValidated">
                    {{isValidated ? formatCurrency(validatedPayAmount) : 'Validate to calculate'}}
                  </div>
                </div>
                <div class="bg-white p-3 rounded-lg border" *ngIf="hasNegativeShareAdjustment() && isValidated">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Negative Share Adjustment</label>
                  <div class="text-lg font-semibold text-red-600">-{{formatCurrency(validatedNegativeShareAdjustment)}}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Surety Tables -->
          <div class="bg-white p-4 border">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
        
        <!-- Payment Mode Section -->
        <div class="bg-white p-4 border">
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
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Bank</label>
                <select formControlName="bank" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <option value="">-- Select Bank --</option>
                  <option *ngFor="let b of banks" [value]="b">{{b}}</option>
                </select>
              </div>
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Cheque No.</label>
                <input formControlName="chequeNo" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
              <div>
                <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Cheque Date</label>
                <input type="date" formControlName="chequeDate" 
                  class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end flex-wrap gap-2 w-full md:w-auto">
          <button type="button" (click)="onClear()" class=" text-xs px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">
            Clear
          </button>
          <button type="button" (click)="onValidate()" class=" text-xs px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">
            Validate
          </button>
          <button type="submit" (click)="onSave()" [disabled]="!canSave" 
            class=" text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
            Save
          </button>
        </div>
      </form>
    </div>

    <!-- Member Selection Popup -->
    <div *ngIf="showMemberPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center  z-[9999]">
      <div class="bg-white rounded-lg  w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        <div class="bg-[#4f46e4] px-6 py-3 text-white">  
          <h3 class="text-lg font-semibold">Select Member</h3>
        </div>
        <div class="p-6">
        <div class="mb-4">
          <input type="text" placeholder="Search members..." [(ngModel)]="memberSearchTerm" 
            (input)="filterMembers()" class="w-full p-2 border rounded">
        </div>
        <div class="overflow-y-auto flex-grow">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 text-left text-xs font-medium text-gray-500">MemNo</th>
                <th class="p-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th class="p-2 text-left text-xs font-medium text-gray-500">Share</th>
                <th class="p-2 text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let m of filteredMembers" class="hover:bg-gray-50">
                <td class="p-2 text-sm">{{ m.memNo }}</td>
                <td class="p-2 text-sm">{{ m.name }}</td>
                <td class="p-2 text-sm">{{ m.bankingDetails?.share }}</td>
                <td class="p-2 text-center">
                  <button (click)="selectMember(m)" class="px-3 py-1 bg-[#4f46e4] text-white rounded text-xs">
                    Select
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex justify-end">
          <button (click)="showMemberPopup = false" class="px-4 py-2 bg-gray-300 rounded mr-2">Cancel</button>
        </div>
        </div>
      </div>
    </div>
  `
})
export class LoanTakenComponent implements OnInit {
  form: FormGroup;
  canSave = false;
  activeTab: 'given' | 'taken' = 'given';
  showMemberPopup = false;
  memberSearchTerm = '';
  filteredMembers: Member[] = [];
  societyLimits: SocietyLimitDto | null = null;

  isValidated = false;
  validatedNewLoanShare = 0;
  validatedPayAmount = 0;
  validatedNegativeShareAdjustment = 0;

  // Loan types array
  // loanTypes = ['General', 'Emergency', 'Festival', 'LAS', 'LA FDR'];
  loanTypes: any[] = [];

  members: Member[] = [];
  banks = ['State Bank', 'HDFC', 'ICICI', 'Axis Bank'];

  selectedMember: Member | null = null;
  givenSurety: Array<{ memNo: string; name: string }> = [];
  takenSurety: Array<{ memNo: string; name: string }> = [];

  constructor(
    private fb: FormBuilder,
    private loanService?: LoanTakenService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      loanNo: [this.generateLoanNoStr()],
      loanDate: [today, Validators.required],
      edpNo: [''],
      loanType: ['General', Validators.required],
      memberName: ['', Validators.required],
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

  async ngOnInit() {
    await this.loadMembers();
    await this.loadSocietyLimits();
    this.loanService?.getSocietyLimits().subscribe((res: any) => {
      if (res?.loanTypes) {
        this.loanTypes = JSON.parse(res.loanTypes);  // already array of objects
        console.log('Loan Types ==>', this.loanTypes);
      }
    });
  }

  async loadMembers() {
    try {
      this.members = (await this.loanService?.getMembers().toPromise() || []).map((m: any) => ({
        ...m,
        bankingDetails: m.bankingDetails
          ? {
            ...m.bankingDetails,
            share: Number(m.bankingDetails.share) || 0   // convert string → number
          }
          : undefined
      }));
      this.filteredMembers = [...this.members];
      console.log('this.filteredMembers == ', this.filteredMembers)
    } catch (error) {
      console.error('Error loading members:', error);
      alert('Failed to load members');
    }
  }

  async loadSocietyLimits() {
    try {
      this.societyLimits = await this.loanService?.getSocietyLimits().toPromise() || null;
    } catch (error) {
      console.error('Error loading society limits:', error);
      alert('Failed to load society limits');
    }
  }

  // Get share value from member (handles both number and string formats)
  getShareValue(member: Member | null): number {
    if (!member) return 0;

    // console.log(typeof (member as any).share === 'number')
    // console.log(member.bankingDetails.share)
    // Handle both number and string share values
    if (typeof (member as any).share === 'number') {
      return (member as any).share;
    } else if (typeof member.bankingDetails?.share === 'string') {
      // console.log('testing')
      return parseFloat(member.bankingDetails.share) || 0;
    }
    return member.bankingDetails.share;
  }

  // Get member share for display in popup
  getMemberShare(member: Member): number | string {
    if (typeof (member as any).share === 'number') {
      console.log('(member as any).share = ', (member as any).share)
      return (member as any).share;
    } else if (typeof member.bankingDetails?.share === 'string') {
      console.log('member.bankingDetails.share = ', member.bankingDetails.share)
      return member.bankingDetails.share;
    }
    return 0;
  }

  // Check if current loan type is General
  isGeneralLoan() {
    return this.form.get('loanType')?.value === 'General Loan';
  }

  generateLoanNoStr() {
    const t = Date.now().toString().slice(-6);
    return `LN-${new Date().getFullYear()}-${t}`;
  }

  generateLoanNo() {
    this.form.patchValue({ loanNo: this.generateLoanNoStr() });
  }

  openMemberPopup() {
    this.showMemberPopup = true;
    this.memberSearchTerm = '';
    this.filterMembers();
  }

  filterMembers() {
    if (!this.memberSearchTerm) {
      this.filteredMembers = [...this.members];
      return;
    }

    const term = this.memberSearchTerm.toLowerCase();
    this.filteredMembers = this.members.filter(m =>
      m.memNo.toLowerCase().includes(term) ||
      m.name.toLowerCase().includes(term)
    );
  }

  // Reset validation when member changes
  selectMember(member: Member) {
    this.form.patchValue({
      edpNo: member.memNo,
      memberName: member.name
    });
    this.selectedMember = member;
    this.showMemberPopup = false;
    this.isValidated = false;

    this.loadSuretyInformation(member.memNo);
  }

  loadSuretyInformation(memberNo: string) {
    // Implement API call to get surety information
    // For now, using mock data
    this.givenSurety = [
      { memNo: 'M002', name: 'Suresh Patel' },
      { memNo: 'M005', name: 'Priya Singh' }
    ];
    this.takenSurety = [
      { memNo: 'M008', name: 'Rajesh Kumar' }
    ];
  }

  onClose() { this.onClear(); }

  onClear() {
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      loanNo: this.generateLoanNoStr(),
      loanDate: today,
      edpNo: '',
      loanType: 'General',
      memberName: '',
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

  formatCurrency(v: number | string) {
    const numValue = typeof v === 'string' ? parseFloat(v) || 0 : v;
    return '₹' + (Number(numValue) || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  onEdpSelect() {
    const memNo = this.form.get('edpNo')!.value;
    const member = this.members.find(m => m.memNo === memNo);
    if (member) {
      this.selectedMember = member;
      this.form.patchValue({ memberName: member.name });
      this.loadSuretyInformation(memNo);
    }
  }

  isCheque() { return this.form.get('paymentMode')!.value === 'Cheque'; }

  // Reset validation status when form changes
  // onLoanTypeChange() {
  //   this.recalculate();
  //   this.isValidated = false;

  //   // Reset purpose validation based on loan type
  //   if (this.isGeneralLoan()) {
  //     this.form.get('purpose')?.clearValidators();
  //   } else {
  //     this.form.get('purpose')?.setValidators([Validators.required]);
  //   }
  //   this.form.get('purpose')?.updateValueAndValidity();
  // }

  getLoanTypeData(selectedLoanType: string) {
    if (!this.societyLimits) return null;

    const tabsLoanTypes = JSON.parse(this.societyLimits?.loanTypes);
    return tabsLoanTypes.find((t: any) => t.LoanType === selectedLoanType) || null;
  }


  onLoanTypeChange() {
    const selectedLoanType = this.form.get('loanType')?.value;
    const loanData = this.getLoanTypeData(selectedLoanType);

    console.log("Selected LoanType Data ==>", loanData);
    // Example: { LoanType: "Emergency Loan", CompulsoryDeposit: 0, Share: 10000, Limit: 100000, ... }
  }


  onPaymentModeChange() { }

  get interestRate() {
    // Different interest rates for different loan types
    switch (this.form.get('loanType')?.value) {
      case 'General Loan': return 0.07;
      case 'Emergency Loan': return 0.09;
      case 'Festival Loan': return 0.09;
      case 'LAS': return 0.09;
      case 'LA FDR': return 0.09;
      default: return 0.07;
    }
  }

  netLoan() {
    return (Number(this.form.get('loanAmount')!.value) || 0) - (Number(this.form.get('previousLoan')!.value) || 0);
  }

  // installmentAmount() {
  //   console.log('validatedPayAmount == ', this.validatedPayAmount)
  //   // const loan = Number(this.form.get('loanAmount')!.value) || 0;
  //   // const loan = this.validatedPayAmount || 0;
  //   const loan = (Number(this.form.get('loanAmount')!.value)) - this.validatedNewLoanShare;
  //   console.log('loan == ', loan)
  //   const n = Number(this.form.get('installments')!.value) || 1;
  //   if (n <= 0) return 0;
  //   return Math.round((((loan) + loan) / n + Number.EPSILON) * 100) / 100;
  //   // return Math.round((((loan * this.interestRate) + loan) / n + Number.EPSILON) * 100) / 100;
  // }

  installmentAmount() {
    console.log('validatedPayAmount == ', this.validatedPayAmount);

    // loan = entered loan amount - new loan share
    const loan = (Number(this.form.get('loanAmount')!.value) || 0) - (this.validatedNewLoanShare || 0);
    console.log('loan == ', loan);

    const n = Number(this.form.get('installments')!.value) || 1;
    if (n <= 0) return 0;

    // Divide loan equally into installments (no interest included)
    return Math.round((loan / n + Number.EPSILON) * 100) / 100;
  }


  newLoanShare() {
    // Only calculate for General loans
    if (!this.isGeneralLoan()) return 0;

    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const historyShare = this.getShareValue(this.selectedMember);
    const required = loan * 0.1;
    const extra = required > historyShare ? (required - historyShare) : 0;
    return Math.round((extra + Number.EPSILON) * 100) / 100;
  }

  // Calculate negative share adjustment for non-general loans
  negativeShareAdjustment() {
    if (this.isGeneralLoan()) return 0;

    const historyShare = this.getShareValue(this.selectedMember);
    // Only apply adjustment if share is negative
    return historyShare < 0 ? Math.abs(historyShare) : 0;
  }

  // Check if there's a negative share adjustment
  hasNegativeShareAdjustment() {
    return !this.isGeneralLoan() && this.getShareValue(this.selectedMember) < 0;
  }

  payAmount() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const prev = Number(this.form.get('previousLoan')!.value) || 0;

    // For General loans, subtract the new share amount
    if (this.isGeneralLoan()) {
      const newShare = this.newLoanShare();
      return Math.round(((loan - prev) - newShare + Number.EPSILON) * 100) / 100;
    }

    // For other loan types, subtract the previous loan and any negative share adjustment
    const negativeAdjustment = this.negativeShareAdjustment();
    return Math.round((loan - prev - negativeAdjustment + Number.EPSILON) * 100) / 100;
  }

  // Update the enforceLoanRules method to include share limit validation
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

    // Society limit validation - THIS IS THE KEY FIX
    if (this.societyLimits) {
      console.log('this.societyLimits == ', this.societyLimits)
      try {
        const tabsObj = JSON.parse(this?.societyLimits?.tabs);
        const tabsLoanTypes = JSON.parse(this.societyLimits?.loanTypes);
        const loanType = this.form.get('loanType')!.value;
        const loanAmount = Number(this.form.get('loanAmount')!.value) || 0;
        const backLoanAmount = Number(tabsObj.Limit.Loan);


        const selectedLoanType = this.form.get('loanType')?.value;
        const selectLoanData = this.getLoanTypeData(selectedLoanType);
        console.log('fun loaddata == ', selectLoanData)

        // console.log('tabsLoanTypes == ', tabsLoanTypes);
        // console.log('tabsObj == ', tabsObj);
        // console.log('loanAmount == ', loanAmount);
        // console.log('backLoanAmount == ', backLoanAmount);

        // Check if loan amount exceeds society limit and RETURN if it does
        if (loanAmount > selectLoanData?.Limit) {
          return {
            ok: false,
            message: `Loan amount cannot exceed ₹${selectLoanData.Limit}. Current amount: ₹${loanAmount}`
          };
        }

        // Get the appropriate limit based on loan type
        let limit = 0;
        switch (loanType) {
          case 'General': limit = tabsObj.Limit?.loan || 0; break;
          case 'Emergency': limit = tabsObj.Limit?.emergency || 0; break;
          // Add other loan types as needed
          default: limit = 0;
        }

        if (limit > 0 && loanAmount > limit) {
          return {
            ok: false,
            message: `Loan amount (₹${loanAmount}) exceeds the society limit (₹${limit}) for ${loanType} loans`
          };
        }
      } catch (e) {
        console.error('Error parsing society limits:', e);
        return { ok: false, message: 'Error validating society limits' };
      }
    }

    // Check purpose is required for non-General loans
    if (!this.isGeneralLoan() && !this.form.get('purpose')?.value) {
      return { ok: false, message: 'Purpose is required for this loan type' };
    }

    // Check if pay amount is negative after adjustments
    const payAmt = this.calculatePayAmount();
    if (payAmt < 0) {
      return { ok: false, message: `Pay amount cannot be negative after adjustments. Current value: ${this.formatCurrency(payAmt)}` };
    }

    if (this.isCheque() && !this.form.get('chequeDate')!.value)
      return { ok: false, message: 'Cheque date required' };

    return { ok: true };
  }

  calculateLoan() { }

  // Add these calculation methods that don't update the UI until validation
  calculateNewLoanShare(): number {
    if (!this.isGeneralLoan()) return 0;
    console.log('calculateNewLoanShare')

    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const historyShare = this.getShareValue(this.selectedMember);
    const required = loan * 0.1;
    const extra = required > historyShare ? (required - historyShare) : 0;
    return Math.round((extra + Number.EPSILON) * 100) / 100;
  }

  calculateNegativeShareAdjustment(): number {
    if (this.isGeneralLoan()) return 0;
    console.log('calculateNegativeShareAdjustment')

    const historyShare = this.getShareValue(this.selectedMember);
    return historyShare < 0 ? Math.abs(historyShare) : 0;
  }

  calculatePayAmount(): number {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const prev = Number(this.form.get('previousLoan')!.value) || 0;
    console.log('calculatePayAmount')

    if (this.isGeneralLoan()) {
      const newShare = this.calculateNewLoanShare();
      return Math.round(((loan - prev) - newShare + Number.EPSILON) * 100) / 100;
    }

    const negativeAdjustment = this.calculateNegativeShareAdjustment();
    return Math.round((loan - prev - negativeAdjustment + Number.EPSILON) * 100) / 100;
  }

  getLoanTypeLimit(selectedLoanType: string): number {
    if (!this.societyLimits) return 0;

    const tabsLoanTypes = JSON.parse(this.societyLimits?.loanTypes);
    console.log('tabsLoanTypes text == ', tabsLoanTypes)

    // find the object that matches the selected loan type
    const loanObj = tabsLoanTypes.find((t: any) => t.LoanType === selectedLoanType);

    return loanObj ? loanObj.Limit : 0;
  }



  getLoanTypeLimitDisplay(loanType: string): string {
    const limit = this.getLoanTypeLimit(loanType);
    return limit > 0 ? this.formatCurrency(limit) : 'No limit';
  }

  onValidate() {
    const member: Member | null = this.selectedMember;
    const loanType = this.form.get('loanType')?.value;

    // ✅ Special check: General Loan + share = 0
    if (loanType === 'General Loan') {
      const shareValue = this.getShareValue(member);

      if (shareValue === 0) {
        const proceed = confirm(
          "You don't have any share amount, so the amount will be deducted from loan amount.\n\nDo you want to continue?"
        );

        if (!proceed) {
          this.canSave = false;
          this.isValidated = false;
          return; // stop validation
        }
      }
    }

    // ✅ Run loan rules
    const res = this.enforceLoanRules();
    if (!res.ok) {
      alert(res.message);
      this.canSave = false;
      this.isValidated = false;
      return;
    }

    // ✅ Update values after successful validation
    this.validatedNewLoanShare = this.calculateNewLoanShare();
    this.validatedNegativeShareAdjustment = this.calculateNegativeShareAdjustment();
    this.validatedPayAmount = this.calculatePayAmount();

    alert('Validation successful');
    this.canSave = true;
    this.isValidated = true;
  }


  async onSave() {
    if (!this.canSave) {
      alert('Please validate before saving');
      return;
    }

    try {
      const dto: LoanTakenCreateDto = {
        loanNo: this.form.get('loanNo')!.value,
        loanDate: this.form.get('loanDate')!.value,
        loanType: this.form.get('loanType')!.value,
        memberNo: this.form.get('edpNo')!.value,
        loanAmount: Number(this.form.get('loanAmount')!.value),
        previousLoan: Number(this.form.get('previousLoan')!.value),
        installments: Number(this.form.get('installments')!.value),
        purpose: this.form.get('purpose')!.value,
        authorizedBy: this.form.get('authorizedBy')!.value,
        paymentMode: this.form.get('paymentMode')!.value,
        bank: this.form.get('bank')!.value,
        chequeNo: this.form.get('chequeNo')!.value,
        chequeDate: this.form.get('chequeDate')!.value || null
      };

      const result = await this.loanService?.createLoan(dto).toPromise();
      alert('Loan saved successfully!');
      console.log('Loan saved:', result);

      this.canSave = false;
      this.onClear();
    } catch (error: any) {
      console.error('Error saving loan:', error);
      alert(`Failed to save loan: ${error.message || 'Unknown error'}`);
    }
  }

  recalculate() {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const installments = Number(this.form.get('installments')!.value) || 1;
    this.isValidated = false;

    if (installments > 0) {
      const emi = Math.round((((loan * this.interestRate) + loan) / installments + Number.EPSILON) * 100) / 100;
    }
  }

  // Add method to get share limit from society data
  getShareLimit(): number {
    if (!this.societyLimits) return 0;
    try {
      const tabsObj = JSON.parse(this.societyLimits.tabs);
      return tabsObj.Limit.share || 0;
    } catch (e) {
      console.error('Error parsing society limits:', e);
      return 0;
    }
  }
}