
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
import { SocietyService, SocietyDto, SocietyEditPending, LoanTypeDto, CreateSocietyDto } from '../../../services/society.service';
import { map, filter } from 'rxjs/operators'; // ✅ make sure this is imported


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
  societyId: string = '';

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private societyService: SocietyService
  ) {
    this.memberForm = this.createMemberForm();
  }

  ngOnInit() {
    console.log('load mem')
    // 1️⃣ Load societies first
    this.societyService.getSociety()
      .pipe(
        map((res: any) => {
          console.log('Raw response from getSociety():', res);
          return res?.data || res;
        })
      )
      .subscribe({
        next: (societies: any) => {
          console.log('Societies array in subscribe:', societies);
          if (societies) {
            this.societyId = societies?.id;
            console.log('Assigned societyId:', this.societyId);
            this.loadMembers();
          } else {
            console.warn('No societies found!');
          }
        },
        error: (err) => {
          console.error('Error loading societies:', err);
        }
      });


    // 3️⃣ Form status logic
    this.memberForm.get('status')?.valueChanges.subscribe(status => {
      const doRetirementControl = this.memberForm.get('dor');
      if (status === 'Resignation' || status === 'In-Active') {
        doRetirementControl?.enable();
      } else {
        doRetirementControl?.disable();
        doRetirementControl?.reset();
      }
    });
  }


  // Signal getters
  isOffCanvasOpen = () => this.offCanvasOpen();
  isEditMode = () => this.editMode();
  isSubmitting = () => this.submitting();

  private createMemberForm(): FormGroup {
    return this.fb.group({
      memberNo: [''],
      name: ['', Validators.required],
      fhName: ['', Validators.required],
      dateOfBirth: [''],
      mobile: [''],
      mobile2: [''],
      email: ['', Validators.email],
      email2: ['', Validators.email],
      city: [''],
      cdAmount: ['0'],
      pincode: [''],
      status: ['Active'],
      officeAddress: [''],
      residenceAddress: [''],
      designation: [''],
      branch: [''],
      dojJob: [''],
      dor: [{ value: null, disabled: true }],
      dojSociety: [''],
      phoneOffice: [''],
      phoneResidence: [''],
      share: [0],
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
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
    // Members
    console.log(this.societyId)
    this.memberService.getAllMembers(this.societyId).subscribe({
      next: (response: any) => {
        // Check if response has data property or is the array itself
        const members = response.data || response;
        console.log('members = ', members)
        this.allMembers = (Array.isArray(members) ? members : []).map((m: any) => ({
          ...m,
          memberNo: m.memNo || m.memberNo // Handle both cases
        }));
        console.log('this.allMembers = ', this.allMembers);
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
        share: 0,
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
      memberNo: member.id || member.id,
      name: member.name,
      fhName: member.fhName,
      dateOfBirth: member.dob ? new Date(member.dob).toISOString().split('T')[0] : null,
      mobile: member.mobile,
      email: member.email,
      branch: member.branch,
      designation: member.designation,
      dojJob: member.dojOrg ? new Date(member.dojOrg).toISOString().split('T')[0] : null,
      dor: member.dor ? new Date(member.dor).toISOString().split('T')[0] : null,
      dojSociety: member.dojSociety ? new Date(member.dojSociety).toISOString().split('T')[0] : null,
      officeAddress: member.officeAddress,
      residenceAddress: member.residenceAddress,
      city: member.city,
      email2: member.email2,
      mobile2: member.mobile2,
      pincode: member.pincode,
      phoneOffice: member.phoneOffice,
      phoneResidence: member.phoneResidence || member.phoneRes,
      nominee: member.nominee,
      nomineeRelation: member.nomineeRelation,
      cdAmount: member.cdAmount || "0",
      bankName: member.bankName,
      payableAt: member.payableAt,
      accountNumber: member.accountNumber || (member.bankingDetails?.accountNumber),
      status: member.status || 'Active',
      shareDeduction: member.shareDeduction || 0,
      share: member.share,
      withdrawal: member.withdrawal || 0,
      gLoanInstalment: member.gLoanInstalment || 0,
      eLoanInstalment: member.eLoanInstalment || 0
    });

    console.log('Populated form with member:', member);


    // 👇 handle enable/disable based on existing member status
    if (member.status === 'Resignation') {
      this.memberForm.get('dor')?.enable();
    } else {
      this.memberForm.get('dor')?.disable();
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
      // dojOrg: this.toUtcString(formValue.dojJob),
      dor: this.toUtcString(formValue.dor), // 👈 mapped to backend
      email: formValue.email,
      mobile: formValue.mobile,
      mobile2: formValue.mobile2,
      email2: formValue.email2,
      status: formValue.status,
      pincode: formValue.pincode,
      cdAmount: formValue.cdAmount,
      designation: formValue.designation,
      branch: formValue.branch,
      officeAddress: formValue.officeAddress,
      residenceAddress: formValue.residenceAddress,
      city: formValue.city,
      phoneOffice: formValue.phoneOffice,
      phoneRes: formValue.phoneResidence,
      nominee: formValue.nominee,
      nomineeRelation: formValue.nomineeRelation,

      // ✅ Flattened banking fields
      bankName: formValue.bankName,
      accountNumber: formValue.accountNumber,
      payableAt: formValue.payableAt,
      share: formValue.share
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

  onSave(): void {
    const formValue = this.memberForm.value;
    console.log("Form Value:", formValue);

    const currentId = this.currentMember()?.id;

    // 🔹 Map form values into Member object
    const memberData: Member = {
      id: currentId,
      memNo: formValue.memberNo, // backend will auto-generate for create
      memberNo: formValue.memberNo,
      name: formValue.name,
      fhName: formValue.fhName,
      officeAddress: formValue.officeAddress,
      city: formValue.city,
      cdAmount: formValue.cdAmount || "0",
      mobile: formValue.mobile,
      mobile2: formValue.mobile2,
      email: formValue.email,
      email2: formValue.email2,
      pincode: formValue.pincode,
      designation: formValue.designation,
      residenceAddress: formValue.residenceAddress,
      dob: formValue.dateOfBirth,
      dojSociety: formValue.dojSociety,
      // dojOrg: formValue.dojJob,
      dor: formValue.dor || null,
      nominee: formValue.nominee,
      nomineeRelation: formValue.nomineeRelation,
      branch: formValue.branch,
      phoneOffice: formValue.phoneOffice,
      phoneRes: formValue.phoneResidence,
      status: formValue.status,

      // ✅ Flattened banking fields
      bankName: formValue.bankName,
      accountNumber: formValue.accountNumber,
      payableAt: formValue.payableAt,
      share: formValue.share || 0
    };


    if (!currentId) {
      // 🔹 Create Member
      console.log("Creating new member:", memberData);
      console.log("this.societyId:", this.societyId);
      const society_id = this.societyId;

      const payload = {
        ...memberData,
        societyId: society_id
      };

      this.memberService.createMember(payload).subscribe({
        next: (res) => {
          console.log("Create successful:", res);
          this.showSnackBar("Member created successfully!");
          this.loadMembers();
          this.closeOffCanvas();
        },
        error: (err) => {
          console.error("Create failed:", err);
          this.showSnackBar("Failed to create member: " + err.message);
        }
      });

    } else {
      // 🔹 Update Member
      console.log("Updating member:", memberData.cdAmount);
      this.memberService.updateMember(currentId, memberData).subscribe({
        next: (res) => {
          console.log("Update successful:", res);
          this.showSnackBar("Member updated successfully!");
          this.loadMembers();
          this.closeOffCanvas();
        },
        error: (err) => {
          console.error("Update failed:", err);
          this.showSnackBar("Failed to update member: " + err.message);
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
