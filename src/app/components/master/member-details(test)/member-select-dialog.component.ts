// member-select-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Member } from '../../../services/member.service';

@Component({
  selector: 'app-member-select-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  template: `
    <div class="p-4 w-full max-w-4xl">
      <h2 class="text-xl font-bold mb-4">Select Member</h2>
      
      <div class="mb-4">
        <mat-form-field appearance="outline" class="w-full">
          <input matInput placeholder="Search members..." (input)="onSearch($event)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <table mat-table [dataSource]="filteredMembers" class="w-full">
          <!-- Member Number Column -->
          <ng-container matColumnDef="memberNo">
            <th mat-header-cell *matHeaderCellDef>Member No.</th>
            <td mat-cell *matCellDef="let member">{{ member.memNo || member.memberNo }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let member">{{ member.name }}</td>
          </ng-container>

          <!-- Mobile Column -->
          <ng-container matColumnDef="mobile">
            <th mat-header-cell *matHeaderCellDef>Mobile</th>
            <td mat-cell *matCellDef="let member">{{ member.mobile }}</td>
          </ng-container>

          <!-- Action Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let member">
              <button mat-raised-button color="primary" (click)="selectMember(member)">
                Select
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <div class="flex justify-end mt-4">
        <button mat-button (click)="onCancel()">Cancel</button>
      </div>
    </div>
  `
})
export class MemberSelectDialogComponent {
  displayedColumns: string[] = ['memberNo', 'name', 'mobile', 'actions'];
  filteredMembers: Member[] = [];

  constructor(
    public dialogRef: MatDialogRef<MemberSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: Member[] }
  ) {
    this.filteredMembers = [...data.members];
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.filteredMembers = this.data.members.filter(member => 
      member.name.toLowerCase().includes(searchValue) ||
      (member.memNo || member.memberNo || '').toLowerCase().includes(searchValue) ||
      (member.mobile || '').includes(searchValue)
    );
  }

  selectMember(member: Member): void {
    this.dialogRef.close(member);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}