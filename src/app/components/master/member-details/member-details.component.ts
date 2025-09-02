
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberService, Member } from '../../../services/member.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberViewDialogComponent } from './member-view-dialog.component';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit {
  memberForm: FormGroup;
  dataSource = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['memberNo', 'name', 'fhName', 'dateOfBirth', 'mobile', 'email', 'designation', 'actions'];

  // Signals for component state
  private offCanvasOpen = signal(false);
  private editMode = signal(false);
  private currentMember = signal<Member | null>(null);
  private submitting = signal(false);

  searchTerm: string = '';
  allMembers: Member[] = [];

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.memberForm = this.createMemberForm();
  }

  ngOnInit() {
    this.loadMembers();
    
    // Check for edit query parameter
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        const memberId = parseInt(params['edit']);
        const member = this.allMembers.find(m => m.id === memberId);
        if (member) {
          this.openOffCanvas('edit', member);
        }
      }
    });
  }

  // Signal getters
  isOffCanvasOpen = () => this.offCanvasOpen();
  isEditMode = () => this.editMode();
  isSubmitting = () => this.submitting();

  private createMemberForm(): FormGroup {
    return this.fb.group({
      memberNo: ['', Validators.required],
      name: ['', Validators.required],
      fhName: ['', Validators.required],
      dateOfBirth: [''],
      mobile: [''],
      email: ['', Validators.email],
      designation: [''],
      dojJob: [''],
      doRetirement: [''],
      branch: [''],
      dojSociety: [''],
      officeAddress: [''],
      residenceAddress: [''],
      city: [''],
      phoneOffice: [''],
      phoneResidence: [''],
      nominee: [''],
      nomineeRelation: [''],
      shareAmount: [0, [Validators.min(0)]],
      cdAmount: [0, [Validators.min(0)]],
      bankName: [''],
      payableAt: [''],
      accountNo: [''],
      ifscCode: [''],
      accountHolderName: [''],
      status: ['Active'],
      shareDeduction: [0],
      withdrawal: [0],
      gLoanInstalment: [0],
      eLoanInstalment: [0]
    });
  }

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response: any) => {
        // Check if response has data property or is the array itself
        const members = response.data || response;
        this.allMembers = (Array.isArray(members) ? members : []).map((m: any) => ({
          ...m,
          memberNo: m.memNo || m.memberNo // Handle both cases
        }));
        this.dataSource.data = this.allMembers;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.showSnackBar('Error loading members');
      }
    });
  }


  onSearch() {
    if (!this.searchTerm.trim()) {
      this.dataSource.data = this.allMembers;
      return;
    }

    const filtered = this.allMembers.filter(member =>
      member.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      member.memberNo?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      member.mobile?.includes(this.searchTerm)
    );

    this.dataSource.data = filtered;
  }

  openOffCanvas(mode: 'create' | 'edit', member?: Member) {
    this.editMode.set(mode === 'edit');

    if (mode === 'edit' && member) {
      this.currentMember.set(member);
      this.populateForm(member);
    } else {
      this.currentMember.set(null);
      this.memberForm.reset();
      this.memberForm.patchValue({
        shareAmount: 0,
        cdAmount: 0,
        status: 'Active'
      });
    }

    this.offCanvasOpen.set(true);
  }

  closeOffCanvas() {
    this.offCanvasOpen.set(false);
    this.memberForm.reset();
    this.editMode.set(false);
    this.currentMember.set(null);
  }

  populateForm(member: any) {
    // Helper function to safely convert date
    const formatDate = (dateValue: any) => {
      if (!dateValue) return '';
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    // Map form field names to API field names
    this.memberForm.patchValue({
      memberNo: member.memNo || member.memberNo || '',
      name: member.name || '',
      fhName: member.fhName || '',
      dateOfBirth: formatDate(member.dob),
      mobile: member.mobile || '',
      email: member.email || '',
      designation: member.designation || '',
      dojJob: formatDate(member.dojOrg),
      doRetirement: formatDate(member.dor),
      branch: member.branch || '',
      dojSociety: formatDate(member.dojSociety),
      officeAddress: member.officeAddress || '',
      residenceAddress: member.residenceAddress || '',
      city: member.city || '',
      phoneOffice: member.phoneOffice || '',
      phoneResidence: member.phoneResidence || member.phoneRes || '',
      nominee: member.nominee || '',
      nomineeRelation: member.nomineeRelation || '',
      shareAmount: member.shareAmount || 0,
      cdAmount: member.cdAmount || 0,
      bankName: member.bankName || (member.bankingDetails?.bankName) || '',
      payableAt: member.payableAt || member.branchName || (member.bankingDetails?.branchName) || '',
      accountNo: member.accountNo || (member.bankingDetails?.accountNumber) || '',
      ifscCode: member.ifscCode || (member.bankingDetails?.ifscCode) || '',
      accountHolderName: member.accountHolderName || (member.bankingDetails?.accountHolderName) || '',
      status: member.status || 'Active',
      shareDeduction: member.shareDeduction || 0,
      withdrawal: member.withdrawal || 0,
      gLoanInstalment: member.gLoanInstalment || 0,
      eLoanInstalment: member.eLoanInstalment || 0
    });
  }

  private transformFormDataToApi(formData: any): any {
    // Helper function to safely convert date string to ISO format
    const formatDateForApi = (dateValue: any) => {
      if (!dateValue) return null;
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date.toISOString();
      } catch {
        return null;
      }
    };

    return {
      memNo: formData.memberNo || '',
      name: formData.name || '',
      fhName: formData.fhName || '',
      dob: formatDateForApi(formData.dateOfBirth),
      mobile: formData.mobile || null,
      email: formData.email || null,
      designation: formData.designation || null,
      dojOrg: formatDateForApi(formData.dojJob),
      dor: formatDateForApi(formData.doRetirement),
      branch: formData.branch || null,
      dojSociety: formatDateForApi(formData.dojSociety),
      officeAddress: formData.officeAddress || null,
      residenceAddress: formData.residenceAddress || null,
      city: formData.city || null,
      phoneOffice: formData.phoneOffice || null,
      phoneRes: formData.phoneResidence || null,
      nominee: formData.nominee || null,
      nomineeRelation: formData.nomineeRelation || null,
      shareAmount: Number(formData.shareAmount) || 0,
      cdAmount: Number(formData.cdAmount) || 0,
      status: formData.status || 'Active',
      shareDeduction: Number(formData.shareDeduction) || 0,
      withdrawal: Number(formData.withdrawal) || 0,
      gLoanInstalment: Number(formData.gLoanInstalment) || 0,
      eLoanInstalment: Number(formData.eLoanInstalment) || 0,
      // Nested object as per schema
      bankingDetails: {
        bankName: formData.bankName || '',
        accountNumber: formData.accountNo || '',
        branchName: formData.payableAt || '',
        ifscCode: formData.ifscCode || '',
        accountHolderName: formData.accountHolderName || ''
      }
    };
  }



  onSubmit() {
    if (this.memberForm.valid) {
      this.submitting.set(true);
      const formData = this.transformFormDataToApi(this.memberForm.value);

      if (this.isEditMode()) {
        const currentMember = this.currentMember();
        if (currentMember) {
          this.memberService.updateMember(currentMember.id!, formData).subscribe({
            next: () => {
              this.showSnackBar('Member updated successfully');
              this.loadMembers();
              this.closeOffCanvas();
            },
            error: (error) => {
              console.error('Error updating member:', error);
              this.showSnackBar('Error updating member: ' + error.message);
            },
            complete: () => this.submitting.set(false)
          });
        }
      } else {
        this.memberService.createMember(formData).subscribe({
          next: () => {
            this.showSnackBar('Member created successfully');
            this.loadMembers();
            this.closeOffCanvas();
          },
          error: (error) => {
            console.error('Error creating member:', error);
            this.showSnackBar('Error creating member: ' + error.message);
          },
          complete: () => this.submitting.set(false)
        });
      }
    }
  }

  // In your service methods, add more detailed error logging
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred';
    if (error.status === 401) {
      errorMessage = 'Unauthorized - Please login again.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      // Log the full error for debugging
      console.error('Full error details:', error);

      // Check for validation errors
      if (error.error && typeof error.error === 'object') {
        const validationErrors = [];
        for (const key in error.error) {
          if (error.error.hasOwnProperty(key)) {
            validationErrors.push(`${key}: ${error.error[key]}`);
          }
        }
        if (validationErrors.length > 0) {
          errorMessage += ` | Validation: ${validationErrors.join(', ')}`;
        }
      }
    }
    console.error('API Error:', error);
    // return throwError(() => new Error(errorMessage));
  }

  onView(member: Member) {
    const dialogRef = this.dialog.open(MemberViewDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: member
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.openOffCanvas('edit', result.member);
      }
    });
  }

  onEdit(member: Member) {
    this.openOffCanvas('edit', member);
  }

  onDelete(member: Member) {
    if (confirm(`Are you sure you want to delete member ${member.name}?`)) {
      this.memberService.deleteMember(member.id!).subscribe({
        next: () => {
          this.showSnackBar('Member deleted successfully');
          this.loadMembers();
        },
        error: (error) => {
          console.error('Error deleting member:', error);
          this.showSnackBar('Error deleting member');
        }
      });
    }
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
