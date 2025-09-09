import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Member } from '../../../services/member.service';

@Component({
  selector: 'app-member-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Member Details</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Profile Section -->
        <div class="md:col-span-1">
          <mat-card class="p-4">
            <div class="flex flex-col items-center">
              <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 text-2xl font-bold">{{data.name?.charAt(0)}}</span>
              </div>
              <h3 class="text-xl font-semibold">{{data.name}}</h3>
              <p class="text-gray-600">{{data.memberNo}}</p>
              <div class="mt-3 px-3 py-1 rounded-full text-xs font-medium"
                  [class.bg-green-100]="data.status === 'Active'"
                  [class.text-green-800]="data.status === 'Active'"
                  [class.bg-red-100]="data.status !== 'Active'"
                  [class.text-red-800]="data.status !== 'Active'">
                {{data.status || 'N/A'}}
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Details Section -->
        <div class="md:col-span-2">
          <mat-card class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Personal Details -->
              <div>
                <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                  <mat-icon class="mr-2 text-blue-500" style="font-size: 20px;">person</mat-icon>
                  Personal Details
                </h4>
                <div class="space-y-2">
                  <p><span class="text-gray-600">Father/Husband:</span> {{data.fhName || 'N/A'}}</p>
                  <p><span class="text-gray-600">Date of Birth:</span> {{(data.dateOfBirth | date) || 'N/A'}}</p>
                  <p><span class="text-gray-600">Mobile:</span> {{data.mobile || 'N/A'}}</p>
                  <p><span class="text-gray-600">Email:</span> {{data.email || 'N/A'}}</p>
                  <p><span class="text-gray-600">City:</span> {{data.city || 'N/A'}}</p>
                </div>
              </div>

              <!-- Professional Details -->
              <div>
                <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                  <mat-icon class="mr-2 text-green-500" style="font-size: 20px;">work</mat-icon>
                  Professional Details
                </h4>
                <div class="space-y-2">
                  <p><span class="text-gray-600">Designation:</span> {{data.designation || 'N/A'}}</p>
                  <p><span class="text-gray-600">Branch:</span> {{data.branch || 'N/A'}}</p>
                  <p><span class="text-gray-600">DOJ Job:</span> {{(data.dojJob | date) || 'N/A'}}</p>
                  <p><span class="text-gray-600">Retirement:</span> {{(data.doRetirement | date) || 'N/A'}}</p>
                  <p><span class="text-gray-600">DOJ Society:</span> {{(data.dojSociety | date) || 'N/A'}}</p>
                </div>
              </div>

              <!-- Address Details -->
              <div class="md:col-span-2">
                <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                  <mat-icon class="mr-2 text-purple-500" style="font-size: 20px;">location_on</mat-icon>
                  Address Details
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-gray-600">Office Address:</p>
                    <p>{{data.officeAddress || 'N/A'}}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Residence Address:</p>
                    <p>{{data.residenceAddress || 'N/A'}}</p>
                  </div>
                </div>
              </div>

              <!-- Financial Details -->
              <div class="md:col-span-2">
                <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                  <mat-icon class="mr-2 text-amber-500" style="font-size: 20px;">account_balance</mat-icon>
                  Financial Details
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-gray-600">Share Amount:</p>
                    <p>{{data.shareAmount | currency:'INR'}}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">CD Amount:</p>
                    <p>{{data.cdAmount | currency:'INR'}}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Bank Name:</p>
                    <p>{{data.bankName || 'N/A'}}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Account No:</p>
                    <p>{{data.accountNo || 'N/A'}}</p>
                  </div>
                </div>
              </div>

              <!-- Nominee Details -->
              <div class="md:col-span-2">
                <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                  <mat-icon class="mr-2 text-red-500" style="font-size: 20px;">people</mat-icon>
                  Nominee Details
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-gray-600">Nominee Name:</p>
                    <p>{{data.nominee || 'N/A'}}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Relation:</p>
                    <p>{{data.nomineeRelation || 'N/A'}}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button mat-raised-button color="primary" (click)="onClose()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .text-gray-600 {
      color: #718096;
      font-weight: 500;
    }
  `]
})
export class MemberViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MemberViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Member
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}