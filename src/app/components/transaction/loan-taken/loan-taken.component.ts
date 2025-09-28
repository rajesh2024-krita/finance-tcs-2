import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { LoanTakenService, MemberDto, LoanTakenResponseDto, LoanTakenCreateDto, SocietyLimitDto, Member, LoanTypeDto } from '../../../services/loan-taken.service';
import { max, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-loan-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './loan-taken.component.html' // Extract template to separate file for better organization
})
export class LoanTakenComponent implements OnInit {
  form: FormGroup;
  canSave = false;
  activeTab: 'given' | 'taken' = 'given';
  showMemberPopup = false;
  showLoanPopup = false;
  memberSearchTerm = '';
  loanSearchTerm = '';
  filteredMembers: Member[] = [];
  filteredLoans: LoanTakenResponseDto[] = [];
  allLoans: LoanTakenResponseDto[] = [];
  societyLimits: SocietyLimitDto | null = null;

  isValidated = false;
  validatedNewLoanShare = 0;
  validatedPayAmount = 0;
  validatedNegativeShareAdjustment = 0;

  loanTypes: LoanTypeDto[] = [];
  members: Member[] = [];
  // banks = ['State Bank', 'HDFC', 'ICICI', 'Axis Bank'];
  banks: any[] = [];

  selectedMember: Member | null = null;
  givenSurety: Array<{ memNo: string; name: string }> = [];
  takenSurety: Array<{ memNo: string; name: string }> = [];

  constructor(
    private fb: FormBuilder,
    private loanService: LoanTakenService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      loanNo: [''],
      loanDate: [today, Validators.required],
      loanTypeId: ['', Validators.required],
      memberId: ['', Validators.required],
      memberNo: ['', Validators.required],
      memberName: ['', Validators.required],
      loanAmount: [0, [Validators.required, Validators.min(1)]],
      newLoanShare: [0, [Validators.required, Validators.min(0)]],
      previousLoan: [0, [Validators.min(0)]],
      negativeShareAdjustment: [0, [Validators.required]],
      installments: [60, [Validators.required, Validators.min(1), Validators.max(60)]],
      purpose: [''],
      authorizedBy: [''],
      paymentMode: ['Cash'],
      bank: [0],
      chequeNo: [''],
      chequeDate: [null],
      payAmount: [0, [Validators.required, Validators.min(0)]],
      netLoan: [0],
      installmentAmount: [0]
    });
  }

  async loadBanks() {
  try {
    this.banks = await firstValueFrom(this.loanService.getBankAccount());
    console.log('Banks loaded:', this.banks);
  } catch (error) {
    console.error('Error loading banks:', error);
    alert('Failed to load bank accounts');
  }
}

  async ngOnInit() {
    await this.loadLoanTypes();
    await this.loadLoans();
    await this.loadMembers();
    await this.loadSocietyLimits();
    await this.loadBanks();
  }

  get isExistingLoan(): boolean {
    return !!this.form.get('loanNo')?.value?.trim();
  }

  async loadLoanTypes() {
    try {
      this.loanTypes = await firstValueFrom(this.loanService.getLoanTypes());
      console.log('Loan Types loaded:', this.loanTypes);
    } catch (error) {
      console.error('Error loading loan types:', error);
      alert('Failed to load loan types');
    }
  }

  async loadLoans() {
    try {
      this.allLoans = await firstValueFrom(this.loanService.getLoans());
      this.filteredLoans = [...this.allLoans];
      console.log("Loaded loans:", this.allLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
      alert('Failed to load loans');
      this.allLoans = [];
      this.filteredLoans = [];
    }
  }

  async loadMembers() {
    try {
      const membersData = await firstValueFrom(this.loanService.getMembers());
      this.members = membersData.map((m: any) => ({
        ...m,
        bankingDetails: m.bankingDetails ? {
          ...m.bankingDetails,
          share: Number(m.bankingDetails.share) || 0
        } : { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountHolderName: '', share: 0 }
      }));
      this.filteredMembers = [...this.members];
      console.log('Members loaded:', this.filteredMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      alert('Failed to load members');
    }
  }

  async loadSocietyLimits() {
    try {
      this.societyLimits = await firstValueFrom(this.loanService.getSocietyLimits());
      console.log('Society limits loaded:', this.societyLimits);
    } catch (error) {
      console.error('Error loading society limits:', error);
      alert('Failed to load society limits');
    }
  }

  getShareValue(member: Member | null): number {
    if (!member) return 0;
    return member.bankingDetails?.share || 0;
  }

  getMemberShare(member: Member): number {
    return this.getShareValue(member);
  }
  //  isGeneralLoan() {
  //   const selectedLoanTypeId = Number(this.form.get('loanTypeId')?.value); // ✅ force number
  //   console.log('selectedLoanTypeId == ', selectedLoanTypeId);
  //   console.log('this.loanTypes == ', this.loanTypes);

  //   for (const lt of this.loanTypes) {
  //     console.log('Checking loanTypeId: ', lt.loanTypeId);
  //     if (lt.loanTypeId === selectedLoanTypeId) {
  //       console.log('Matched Loan Type == ', lt);
  //       return lt.name === 'General Loan';
  //     }
  //   }

  //   return false; // if not found
  // }

  isGeneralLoan() {
    const selectedLoanTypeId = Number(this.form.get('loanTypeId')?.value);
    const loanType = this.loanTypes.find(lt => lt.loanTypeId === selectedLoanTypeId);
    return loanType?.name === 'General Loan';
  }

  getSelectedLoanType() {
    const selectedLoanTypeId = Number(this.form.get('loanTypeId')?.value); // force to number
    // console.log('selectedLoanTypeId == ', selectedLoanTypeId);
    // console.log('this.loanTypes == ', this.loanTypes);

    const selected = this.loanTypes.find(
      (lt: any) => Number(lt.loanTypeId) === selectedLoanTypeId
    );

    console.log('selectedLoanType == ', selected);
    return selected;
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

  selectMember(member: Member) {
    this.form.patchValue({
      memberId: member.id,
      memberNo: member.id,
      memberName: member.name
    });
    this.selectedMember = member;
    this.showMemberPopup = false;
    this.isValidated = false;

    // Load member's active loans
    this.loadMemberActiveLoans(member.id!);
    this.loadSuretyInformation(member.memNo);
  }

  async loadMemberActiveLoans(memberId: number) {
    try {
      const memberLoans = await firstValueFrom(this.loanService.getLoansByMember(memberId));
      const activeLoans = memberLoans.filter(loan => loan.status === 'Active');

      if (activeLoans.length > 0) {
        const totalActiveLoan = activeLoans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
        this.form.patchValue({
          previousLoan: totalActiveLoan
        });
      } else {
        this.form.patchValue({
          previousLoan: 0
        });
      }
    } catch (error) {
      console.error('Error loading member loans:', error);
      this.form.patchValue({ previousLoan: 0 });
    }
  }

  loadSuretyInformation(memberNo: string) {
    // Mock data - replace with actual API call
    this.givenSurety = [
      { memNo: 'M002', name: 'Suresh Patel' },
      { memNo: 'M005', name: 'Priya Singh' }
    ];
    this.takenSurety = [
      { memNo: 'M008', name: 'Rajesh Kumar' }
    ];
  }

  onClear() {
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      loanNo: '',
      loanDate: today,
      loanTypeId: '',
      memberId: '',
      memberNo: '',
      memberName: '',
      loanAmount: 0,
      newLoanShare: 0,
      previousLoan: 0,
      negativeShareAdjustment: 0,
      installments: 60,
      purpose: '',
      authorizedBy: '',
      paymentMode: 'Cash',
      bank: 0,
      chequeNo: '',
      chequeDate: null,
      payAmount: 0,
      netLoan: 0,
      installmentAmount: 0
    });
    this.selectedMember = null;
    this.givenSurety = [];
    this.takenSurety = [];
    this.canSave = false;
    this.isValidated = false;
  }

  formatCurrency(v: number | string) {
    const numValue = typeof v === 'string' ? parseFloat(v) || 0 : v;
    return '₹' + (Number(numValue) || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  isCheque() {
    return this.form.get('paymentMode')!.value === 'Cheque';
  }

  onLoanTypeChange() {
    const selectedLoanType = this.getSelectedLoanType()?.name;
    // console.log("Selected LoanType:", selectedLoanType);
    this.isValidated = false;
  }

  onPaymentModeChange() {
    this.isValidated = false;
  }

  netLoan() {
    return (Number(this.form.get('loanAmount')!.value) || 0) - (Number(this.form.get('previousLoan')!.value) || 0);
  }

  installmentAmount() {
    const loan = (Number(this.form.get('loanAmount')!.value) || 0) - (this.validatedNewLoanShare || 0);
    const n = Number(this.form.get('installments')!.value) || 1;
    if (n <= 0) return 0;
    return Math.round((loan / n + Number.EPSILON) * 100) / 100;
  }

  // calculateNewLoanShare(): number {
  //   if (!this.isGeneralLoan()) return 0;

  //   const loan = Number(this.form.get('loanAmount')!.value) || 0;
  //   const historyShare = this.getShareValue(this.selectedMember);
  //   const selectedLoanType = this.getSelectedLoanType();
  //   const sharePercentage = (selectedLoanType?.shareAmount || 10) / 100;
  //   const required = loan * sharePercentage;
  //   const extra = required > historyShare ? (required - historyShare) : 0;
  //   return Math.round((extra + Number.EPSILON) * 100) / 100;
  // }

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
    const historyShare = this.getShareValue(this.selectedMember);
    return historyShare < 0 ? Math.abs(historyShare) : 0;
  }

  calculatePayAmount(): number {
    const loan = Number(this.form.get('loanAmount')!.value) || 0;
    const prev = Number(this.form.get('previousLoan')!.value) || 0;
    if (this.isGeneralLoan()) {
      const newShare = this.calculateNewLoanShare();
      console.log('newShare == ', newShare)
      return Math.round(((loan - prev) - newShare + Number.EPSILON) * 100) / 100;
    }

    const negativeAdjustment = this.calculateNegativeShareAdjustment();
    return Math.round((loan - prev - negativeAdjustment + Number.EPSILON) * 100) / 100;
  }

  hasNegativeShareAdjustment() {
    return !this.isGeneralLoan() && this.getShareValue(this.selectedMember) < 0;
  }

  enforceLoanRules() {
    const loanAmount = Number(this.form.get('loanAmount')!.value) || 0;
    if (loanAmount < 0) return { ok: false, message: 'Loan amount cannot be negative' };

    const installments = Number(this.form.get('installments')!.value) || 0;
    if (!Number.isInteger(installments) || installments <= 0)
      return { ok: false, message: 'Installments must be a positive integer' };

    if (installments > 60)
      return { ok: false, message: 'Installments cannot exceed 60' };

    if (!this.selectedMember)
      return { ok: false, message: 'Select a valid member' };

    // Loan type validation
    const selectedLoanType = this.getSelectedLoanType();
    if (!selectedLoanType) {
      return { ok: false, message: 'Please select a valid loan type' };
    }

    // Loan amount limit validation
    if (selectedLoanType.limitAmount > 0 && loanAmount > selectedLoanType.limitAmount) {
      return {
        ok: false,
        message: `Loan amount cannot exceed ${this.formatCurrency(selectedLoanType.limitAmount)} for ${selectedLoanType.name}`
      };
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

  onValidate() {
    const member: Member | null = this.selectedMember;
    const loanType = this.getSelectedLoanType();

    if (!loanType) {
      alert('Please select a loan type');
      return;
    }

    // Special check for General Loan with zero share
    if (loanType.name === 'General Loan') {
      const shareValue = this.getShareValue(member);
      if (shareValue === 0) {
        const proceed = confirm(
          "You don't have any share amount, so the amount will be deducted from loan amount.\n\nDo you want to continue?"
        );
        if (!proceed) {
          this.canSave = false;
          this.isValidated = false;
          return;
        }
      }
    }

    this.recalculate();
    this.isValidated = true; console.log('Validation complete →', this.form.value);

    const res = this.enforceLoanRules();
    if (!res.ok) {
      alert(res.message);
      this.canSave = false;
      this.isValidated = false;
      return;
    }

    this.validatedNewLoanShare = this.calculateNewLoanShare();
    this.validatedNegativeShareAdjustment = this.calculateNegativeShareAdjustment();
    this.validatedPayAmount = this.calculatePayAmount();

    // Update form values
    this.form.patchValue({
      netLoan: this.netLoan(),
      installmentAmount: this.installmentAmount(),
      newLoanShare: this.validatedNewLoanShare,
      payAmount: this.validatedPayAmount
    });

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
      const formValue = this.form.value;
      const selectedLoanType = this.getSelectedLoanType();

      const dto: LoanTakenCreateDto = {
        societyId: 1, // Default society ID
        memberId: formValue.memberId,
        loanTypeId: formValue.loanTypeId,
        loanDate: new Date(formValue.loanDate).toISOString(),
        loanAmount: Number(formValue.loanAmount),
        installments: Number(formValue.installments),
        purpose: formValue.purpose || null,
        authorizedBy: formValue.authorizedBy || null,
        paymentMode: formValue.paymentMode,
        bank: formValue.bank || 0,
        chequeNo: formValue.chequeNo || null,
        // chequeDate: formValue.chequeDate ? new Date(formValue.chequeDate).toISOString() : null,
        status: 'Pending', // Default status
        netLoan: Number(this.netLoan()),
        installmentAmount: Number(this.installmentAmount()),
        newLoanShare: Number(this.validatedNewLoanShare),
        payAmount: Number(this.validatedPayAmount),
        previousLoan: Number(formValue.previousLoan)
      };

      const result = await firstValueFrom(this.loanService.createLoan(dto));
      alert('Loan saved successfully!');
      console.log('Loan saved:', result);

      this.canSave = false;
      this.onClear();

      // Reload loans to include the new one
      await this.loadLoans();
    } catch (error: any) {
      console.error('Error saving loan:', error);
      alert(`Failed to save loan: ${error.message || 'Unknown error'}`);
    }
  }

  // recalculate() {
  //   this.isValidated = false;
  //   this.canSave = false;
  // }

  recalculate() {
    const newLoanShare = this.calculateNewLoanShare();
    const negShareAdj = this.calculateNegativeShareAdjustment();
    const payAmt = this.calculatePayAmount();

    this.validatedNewLoanShare = newLoanShare;
    this.validatedNegativeShareAdjustment = negShareAdj;
    this.validatedPayAmount = payAmt;

    this.form.patchValue({
      newLoanShare: newLoanShare,
      payAmount: payAmt,
      netLoan: this.netLoan(),
      installmentAmount: this.installmentAmount()
    }, { emitEvent: false }); // prevent infinite loop
  }


  openLoanPopup() {
    this.showLoanPopup = true;
    this.loanSearchTerm = '';
    this.filterLoans();
  }

  filterLoans() {
    if (!this.loanSearchTerm) {
      this.filteredLoans = [...this.allLoans];
      return;
    }

    const term = this.loanSearchTerm.toLowerCase();
    this.filteredLoans = this.allLoans.filter(loan => {
      let loanDateStr = '';
      let loanDateAltStr = '';

      if (loan.loanDate) {
        const d = new Date(loan.loanDate);
        loanDateStr = d.toISOString().split('T')[0];
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        loanDateAltStr = `${day}/${month}/${year}`;
      }

      return (
        (loan.loanTypeName?.toLowerCase() || '').includes(term) ||
        (loan.memberName?.toLowerCase() || '').includes(term) ||
        loanDateStr.includes(term) ||
        loanDateAltStr.includes(term)
      );
    });
  }

  selectLoan(loan: LoanTakenResponseDto) {
    // For existing loans, we might want to view details rather than edit
    alert('This loan already exists. Please create a new loan or select a different action.');
    this.showLoanPopup = false;
  }
}