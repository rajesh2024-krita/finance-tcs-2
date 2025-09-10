
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MemberSelectDialogComponent } from './member-select-dialog.component';

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
  // styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit {
  memberForm: FormGroup;
  dataSource = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['memberNo', 'name', 'mobile', 'status', 'actions'];

  activeTab: string = 'general';

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
    private dialog: MatDialog
  ) {
    this.memberForm = this.createMemberForm();
  }

  ngOnInit() {
    this.loadMembers();

    this.memberForm.get('status')?.valueChanges.subscribe(status => {
    const doRetirementControl = this.memberForm.get('doRetirement');
    if (status === 'Resignation' || status === 'In-Active') {
      doRetirementControl?.enable();   // enable only if resigned
    } else {
      doRetirementControl?.disable();  // otherwise keep disabled
      doRetirementControl?.reset();    // optional: clear old value
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
      mobile2: [''],
      email: ['', Validators.email],
      email2: ['', Validators.email],
      city: [''],
      pincode: [''],
      status: ['Active'],
      officeAddress: [''],
      residenceAddress: [''],
      designation: [''],
      branch: [''],
      dojJob: [''],
      doRetirement: [{ value: '', disabled: true }],
      dojSociety: [''],
      phoneOffice: [''],
      phoneResidence: [''],
      shareAmount: [0],
      cdAmount: [0],
      bankName: ['', Validators.required],
      branchName: [''],
      accountNo: ['', Validators.required],
      accountHolderName: ['', Validators.required],
      ifscCode: ['', Validators.required],
      payableAt: [''],
      shareDeduction: [0],
      withdrawal: [0],
      gLoanInstalment: [0],
      eLoanInstalment: [0],
      nominee: [''],
      nomineeRelation: [''],
    });

  }

  

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response: any) => {
        // Check if response has data property or is the array itself
        const members = response.data || response;
        console.log('members = ', members)
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
        status: 'Active',
        memberNo: this.generateNextMemberId(this.allMembers) // 👈 Auto ID here
      });
    }

    this.offCanvasOpen.set(true);
  }

  /** Generate next MEM_XXX ID */
  private generateNextMemberId(members: Member[]): string {
    if (!members || members.length === 0) {
      return 'MEM_001';
    }

    // Extract numbers from memNo/memberNo like "MEM_001" → 1
    const ids = members
      .map(m => parseInt((m.memNo || m.memberNo || '').replace('MEM_', ''), 10))
      .filter(n => !isNaN(n));

    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = maxId + 1;

    return `MEM_${nextId.toString().padStart(3, '0')}`;
  }

  // Add this method to open the member selection dialog
  openMemberSelectionDialog(): void {
    const dialogRef = this.dialog.open(MemberSelectDialogComponent, {
      width: '800px',
      data: { members: this.allMembers }
    });

    dialogRef.afterClosed().subscribe((selectedMember: Member) => {
      if (selectedMember) {
        this.populateForm(selectedMember);
        this.editMode.set(true);
        this.currentMember.set(selectedMember);
        this.offCanvasOpen.set(true);
      }
    });
  }

  closeOffCanvas() {
    this.offCanvasOpen.set(false);
    this.memberForm.reset();
    this.editMode.set(false);
    this.currentMember.set(null);
  }

  populateForm(member: any) {
  this.memberForm.patchValue({
    memberNo: member.memNo || member.memberNo,
    name: member.name,
    fhName: member.fhName,
    dateOfBirth: member.dob ? new Date(member.dob).toISOString().split('T')[0] : null,
    mobile: member.mobile,
    email: member.email,
    designation: member.designation,
    dojJob: member.dojOrg ? new Date(member.dojOrg).toISOString().split('T')[0] : null,
    doRetirement: member.dor ? new Date(member.dor).toISOString().split('T')[0] : null,
    dojSociety: member.dojSociety ? new Date(member.dojSociety).toISOString().split('T')[0] : null,
    officeAddress: member.officeAddress,
    residenceAddress: member.residenceAddress,
    city: member.city,
    phoneOffice: member.phoneOffice,
    phoneResidence: member.phoneResidence || member.phoneRes,
    nominee: member.nominee,
    nomineeRelation: member.nomineeRelation,
    shareAmount: member.bankingDetails?.share || 0,
    cdAmount: member.cdAmount || 0,
    bankName: member.bankName || (member.bankingDetails?.bankName),
    payableAt: member.payableAt || member.branchName,
    accountNo: member.accountNo || (member.bankingDetails?.accountNumber),
    status: member.status || 'Active',
    shareDeduction: member.shareDeduction || 0,
    withdrawal: member.withdrawal || 0,
    gLoanInstalment: member.gLoanInstalment || 0,
    eLoanInstalment: member.eLoanInstalment || 0
  });

  // 👇 handle enable/disable based on existing member status
  if (member.status === 'Resignation') {
    this.memberForm.get('doRetirement')?.enable();
  } else {
    this.memberForm.get('doRetirement')?.disable();
  }
}


  private toUtcString(date: any): string | undefined {
    if (!date) return undefined;
    return new Date(date).toISOString();
  }

  // Switch tabs
  // setTab(tab: string) {
  //   this.activeTab = tab;
  // }

  // Reset or cancel
  resetForm() {
    this.memberForm.reset();
    this.activeTab = 'general';
  }


  private transformFormDataToApi(formValue: any): Member {
  return {
    memNo: formValue.memberNo,
    name: formValue.name,
    fhName: formValue.fhName,
    dob: this.toUtcString(formValue.dateOfBirth),
    dojSociety: this.toUtcString(formValue.dojSociety),
    dojOrg: this.toUtcString(formValue.dojJob),
    dor: this.toUtcString(formValue.doRetirement), // 👈 mapped to backend
    email: formValue.email,
    mobile: formValue.mobile,
    designation: formValue.designation,
    branch: formValue.branch,
    officeAddress: formValue.officeAddress,
    residenceAddress: formValue.residenceAddress,
    city: formValue.city,
    phoneOffice: formValue.phoneOffice,
    phoneRes: formValue.phoneResidence,
    nominee: formValue.nominee,
    nomineeRelation: formValue.nomineeRelation,
    bankingDetails: {
      bankName: formValue.bankName,
      accountNumber: formValue.accountNo,
      payableAt: formValue.payableAt,
      share: formValue.share
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
    this.dialog.open(MemberViewDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: member
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onPhotoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Photo uploaded:', file.name);
    }
  }

  onSignatureUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Signature uploaded:', file.name);
    }
  }

  onClear() {
    this.memberForm.reset();
  }

  onPrint() {
    window.print();
  }

  onSave() {
    if (this.memberForm.valid) {
      console.log(this.memberForm.value);
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
