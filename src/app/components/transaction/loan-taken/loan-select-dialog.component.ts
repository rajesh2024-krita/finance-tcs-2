import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoanTakenResponseDto } from 'src/app/services/loan-taken.service';

@Component({
  selector: 'app-loan-select-dialog',
  template: `
    <h2>Select Loan</h2>
    <table>
      <tr *ngFor="let loan of data" (click)="selectLoan(loan)">
        <td>{{loan.loanNo}}</td>
        <td>{{loan.memberNo}}</td>
        <td>{{loan.loanAmount}}</td>
      </tr>
    </table>
    <button (click)="createNew()">Create New Loan</button>
  `
})
export class LoanSelectDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoanSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoanTakenResponseDto[]
  ) {}

  selectLoan(loan: LoanTakenResponseDto) {
    this.dialogRef.close(loan);
  }

  createNew() {
    this.dialogRef.close(null);
  }
}
