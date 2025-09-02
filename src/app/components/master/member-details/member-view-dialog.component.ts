
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Member } from '../../../services/member.service';

@Component({
  selector: 'app-member-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="member-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Member Details</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Member Number</label>
                  <span>{{data.memberNo || data.memNo}}</span>
                </div>
                <div class="info-item">
                  <label>Name</label>
                  <span>{{data.name}}</span>
                </div>
                <div class="info-item">
                  <label>Father/Husband Name</label>
                  <span>{{data.fhName || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>{{data.dateOfBirth ? (data.dateOfBirth | date:'dd/MM/yyyy') : 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Mobile</label>
                  <span>{{data.mobile || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <span>{{data.email || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Designation</label>
                  <span>{{data.designation || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Date of Joining</label>
                  <span>{{data.doj ? (data.doj | date:'dd/MM/yyyy') : 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Status</label>
                  <span class="status-badge" [class.active]="data.status === 'Active'">
                    {{data.status || 'Active'}}
                  </span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Contact Information Tab -->
          <mat-tab label="Contact Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Office Address</label>
                  <span>{{data.officeAddress || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Residence Address</label>
                  <span>{{data.residenceAddress || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>City</label>
                  <span>{{data.city || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Office Phone</label>
                  <span>{{data.phoneOffice || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Residence Phone</label>
                  <span>{{data.phoneRes || data.phoneResidence || 'Not provided'}}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Financial Information Tab -->
          <mat-tab label="Financial Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Share Amount</label>
                  <span>₹{{data.shareAmount || 0 | number:'1.2-2'}}</span>
                </div>
                <div class="info-item">
                  <label>CD Amount</label>
                  <span>₹{{data.cdAmount || 0 | number:'1.2-2'}}</span>
                </div>
                <div class="info-item">
                  <label>Bank Name</label>
                  <span>{{data.bankName || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Account Number</label>
                  <span>{{data.accountNo || 'Not provided'}}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Nominee Information Tab -->
          <mat-tab label="Nominee Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Nominee Name</label>
                  <span>{{data.nominee || 'Not provided'}}</span>
                </div>
                <div class="info-item">
                  <label>Nominee Relation</label>
                  <span>{{data.nomineeRelation || 'Not provided'}}</span>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="editMember()">
          <mat-icon>edit</mat-icon>
          Edit Member
        </button>
      </div>
    </div>
  `,
  styles: [`
    .member-dialog {
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-content {
      padding: 0;
      max-height: 70vh;
      overflow-y: auto;
    }

    .tab-content {
      padding: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      font-size: 0.875rem;
      color: #1f2937;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #fef2f2;
      color: #dc2626;
    }

    .status-badge.active {
      background-color: #f0fdf4;
      color: #16a34a;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background-color: #f9fafb;
    }
  `]
})
export class MemberViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MemberViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Member
  ) {}

  editMember() {
    this.dialogRef.close({ action: 'edit', member: this.data });
  }
}
