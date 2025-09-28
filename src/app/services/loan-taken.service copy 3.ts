import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

// ------------ DTO Interfaces ------------

export interface LoanTakenCreateDto {
  societyId: number;
  memberId: number;
  loanTypeId: number;
  loanDate: string;
  loanAmount: number;
  installments: number;
  purpose?: string;
  authorizedBy?: string;
  paymentMode: string;
  bank?: number;
  chequeNo?: string;
  chequeDate?: string;
  status?: string;
  netLoan: number;
  installmentAmount: number;
  newLoanShare: number;
  payAmount: number;
  previousLoan: number;
}

export interface LoanTakenResponseDto {
  loanId: number;
  societyId: number;
  memberId: number;
  loanTypeId: number;
  loanTypeName: string;
  memberName: string;
  loanDate: string;
  loanAmount: number;
  installments: number;
  purpose: string | null;
  authorizedBy: string | null;
  paymentMode: string;
  status: string;
  bank: number;
  chequeNo: string;
  chequeDate: string;
  netLoan: number;
  installmentAmount: number;
  newLoanShare: number;
  payAmount: number;
  previousLoan: number;
}

export interface MemberDto {
  id: number;
  memNo: string;
  memberNo?: string;
  name: string;
  fhName: string;
  officeAddress?: string;
  city?: string;
  phoneOffice?: string;
  branch?: string;
  phoneRes?: string;
  mobile?: string;
  designation?: string;
  residenceAddress?: string;
  dob?: Date | string;
  dojSociety?: Date | string;
  dojOrg?: Date | string;
  dor?: Date | string;
  email?: string;
  nominee?: string;
  nomineeRelation?: string;
  bankingDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    accountHolderName: string;
    share: number;
  };
  status?: string;
  shareAmount?: number;
  cdAmount?: number;
  bankName?: string;
  accountNo?: string;
  accountHolderName?: string;
  dateOfBirth?: Date | string;
  dojJob?: Date | string;
  doRetirement?: Date | string;
}

export interface BankingDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  share: string;
}

export interface Member {
  id?: number;
  memNo: string;
  memberNo?: string;
  name: string;
  fhName: string;
  officeAddress?: string;
  city?: string;
  phoneOffice?: string;
  branch?: string;
  phoneRes?: string;
  mobile?: string;
  designation?: string;
  residenceAddress?: string;
  dob?: Date | string;
  dojSociety?: Date | string;
  dojOrg?: Date | string;
  dor?: Date | string;
  email?: string;
  nominee?: string;
  nomineeRelation?: string;
  bankingDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    accountHolderName: string;
    share: number;
  };
  status?: string;
  shareAmount?: number;
  cdAmount?: number;
  bankName?: string;
  accountNo?: string;
  accountHolderName?: string;
  dateOfBirth?: Date | string;
  dojJob?: Date | string;
  doRetirement?: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface InterestRatesDto {
  dividend: number;
  od: number;
  cd: number;
  loan: number;
  emergencyLoan: number;
  las: number;
}

export interface LimitsDto {
  share: number;
  loan: number;
  emergencyLoan: number;
}

export interface SocietyTabsDto {
  interest: InterestRatesDto;
  limit: LimitsDto;
}

export interface LoanTypeDto {
  loanTypeId: number;
  societyId: number;
  name: string;
  interestPercent: number;
  limitAmount: number;
  compulsoryDeposit: number;
  optionalDeposit: number;
  shareAmount: number;
  xTimes: number;
}

export interface VoucherDto {
  ledgerAccountId: number;
  particularId: number;
  societyId: number;
  voucherType: string;
  voucherDate: Date | string;   // ISO date string
  narration: string;
  memberId: number;
  loanId: number;
  amount: number;
  bankId: number;
  chequeNumber?: string; // optional if not always used
  chequeDate?: Date | string;   // optional if not always used
}

export interface SocietyLimitDto {
  id: number;
  societyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  dividend: number;
  overdraft: number;
  currentDeposit: number;
  loan: number;
  emergencyLoan: number;
  las: number;
  shareLimit: number;
  loanLimit: number;
  emergencyLoanLimit: number;
  chBounceCharge: string;
  targetDropdown: string;
  dropdownArray: string[];
  loanTypes: any;
  tabs?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ------------ Service ------------

@Injectable({
  providedIn: 'root'
})
export class LoanTakenService {
  private readonly baseUrl = 'https://fintcssociety.onrender.com/api/Loan';
  private readonly memberUrl = 'https://fintcssociety.onrender.com/api/Member';
  private readonly societyUrl = 'https://fintcssociety.onrender.com/api/Society';
  private readonly loanTypeUrl = 'https://fintcssociety.onrender.com/api/LoanType';
  private readonly ledgerAllUrl = 'https://fintcssociety.onrender.com/api/Ledger/all';
  private readonly VoucherCreateUrl = 'https://fintcssociety.onrender.com/api/Voucher/create';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // 📌 Get all members
  getLedgerAll(memberId: any): Observable<any | null> {
    const headers = this.getHeaders();
    console.group('[LedgerService] getLedgerAll START');
    console.log('Input memberId:', memberId, ' (type: ' + typeof memberId + ')');
    console.log('Request URL:', this.ledgerAllUrl);
    console.log('Headers preview:', headers);

    return this.http.get<ApiResponse<any[]>>(`${this.ledgerAllUrl}`, { headers }).pipe(
      map(res => {
        console.group('[LedgerService] map() — validating response');
        console.log('Raw response:', res);

        if (res.success && Array.isArray(res.data)) {
          const inputIdStr = String(memberId);

          const matchedLedger = res.data
            .map((doc: any, idx: number) => {
              console.log('doc === ', doc)
              const docIdStr = String(doc.memberId);
              const isShareLedger = doc.accountName === 'Share Ledger';
              console.log(`[LedgerService] idx=${idx} | doc.MemberId=${doc.memberId} | idsEqual=${docIdStr === inputIdStr} | isShareLedger=${isShareLedger}`);
              return (docIdStr === inputIdStr && isShareLedger) ? doc : null;
            })
            .filter(doc => doc !== null)[0] || null;

          console.log('[LedgerService] matchedLedger:', matchedLedger);
          console.groupEnd();
          return matchedLedger;
        } else {
          console.error('[LedgerService] API returned success=false or invalid data:', res);
          console.groupEnd();
          throw new Error(res.message || 'Failed to fetch members');
        }
      }),
      catchError(err => {
        console.error('[LedgerService] Request failed:', err);
        console.groupEnd();
        return throwError(() => new Error(err.error?.message || err.message || 'Failed to fetch members'));
      })
    );
  }


  // 📌 Get all members
  getMembers(): Observable<MemberDto[]> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<MemberDto[]>>(`${this.memberUrl}?societyId=1`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch members');
      }),
      catchError(err => {
        console.error('Error fetching members:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch members'));
      })
    );
  }

  // 📌 Get loan types
  getLoanTypes(): Observable<LoanTypeDto[]> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<LoanTypeDto[]>>(`${this.loanTypeUrl}?societyId=1`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch loan types');
      }),
      catchError(err => {
        console.error('Error fetching loan types:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch loan types'));
      })
    );
  }

  // 📌 Get loan type by ID
  getLoanTypeById(id: number): Observable<LoanTypeDto> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<LoanTypeDto>>(`${this.loanTypeUrl}/${id}`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch loan type');
      }),
      catchError(err => {
        console.error('Error fetching loan type:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch loan type'));
      })
    );
  }

  createNewShare(dto: LoanTakenCreateDto): void {
    const headers = this.getHeaders();

    if (dto.newLoanShare > 0) {
      this.getLedgerAll(dto.memberId).subscribe({
        next: ledgerAccount => {
          const ledgerId = ledgerAccount?.ledgerAccountId;
          console.log('Ledger account fetched:', ledgerId);

          if (!ledgerId) {
            console.error('Ledger ID not found, cannot create voucher.');
            return;
          }

          const voucherData = {
            ledgerAccountId: ledgerId,
            particularId: ledgerId,
            societyId: dto.societyId,
            voucherType: "Reciept",
            voucherDate: new Date().toISOString(),
            narration: "New share amount",
            memberId: dto.memberId,
            loanId: null,
            amount: dto.newLoanShare,
            bankId: 1,
            chequeNumber: dto.chequeNo,
            chequeDate: dto.chequeDate
          };

          // Make the HTTP request
          this.http.post<ApiResponse<any>>(this.VoucherCreateUrl, voucherData, { headers }).pipe(
            map(res => {
              if (res.success) {
                console.log('Voucher created successfully:', res);
              } else {
                throw new Error(res.message || 'Failed to create voucher');
              }
            }),
            catchError(err => {
              console.error('Error creating voucher:', err);
              return throwError(() => new Error(err.error?.message || 'Failed to create voucher'));
            })
          ).subscribe(); // subscribe to trigger the POST
        },
        error: err => {
          console.error('Error fetching ledger:', err);
        }
      });
    }
  }


  createLoan(dto: LoanTakenCreateDto): Observable<any> {
    // if (dto.newLoanShare > 0) {
    //   this.getLedgerAll(dto.memberId).subscribe({
    //     next: ledgerAccount => {
    //       console.log('Ledger account fetched:', ledgerAccount?.ledgerAccountId);
    //       // You can continue processing here, e.g., call API to create loan
    //     },
    //     error: err => {
    //       console.error('Error fetching ledger:', err);
    //     }
    //   });
    // }

    const headers = this.getHeaders();

    if (dto.newLoanShare > 0) {
      this.getLedgerAll(dto.memberId).subscribe({
        next: ledgerAccount => {
          const ledgerId = ledgerAccount?.ledgerAccountId;
          console.log('Ledger account fetched:', ledgerId);

          if (!ledgerId) {
            console.error('Ledger ID not found, cannot create voucher.');
            return;
          }

          const voucherData = {
            ledgerAccountId: ledgerId,
            particularId: ledgerId,
            societyId: dto.societyId,
            voucherType: "Reciept",
            voucherDate: new Date().toISOString(),
            narration: "New share amount",
            memberId: dto.memberId,
            loanId: null,
            amount: dto.newLoanShare,
            bankId: 1,
            chequeNumber: dto.chequeNo,
            chequeDate: dto.chequeDate
          };

          // Make the HTTP request
          this.http.post<ApiResponse<any>>(this.VoucherCreateUrl, voucherData, { headers }).pipe(
            map(res => {
              if (res.success) {
                console.log('Voucher created successfully:', res);
              } else {
                throw new Error(res.message || 'Failed to create voucher');
              }
            }),
            catchError(err => {
              console.error('Error creating voucher:', err);
              return throwError(() => new Error(err.error?.message || 'Failed to create voucher'));
            })
          ).subscribe(); // subscribe to trigger the POST
        },
        error: err => {
          console.error('Error fetching ledger:', err);
        }
      });
    }

    // 🚫 Commented out actual API call, so it won’t store data
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto, { headers }).pipe(
      map(res => {
        if (res.success) return res;
        throw new Error(res.message || 'Failed to create loan');
      }),
      catchError(err => {
        console.error('Error creating loan:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to create loan'));
      })
    );

    // ✅ Temporary mock response instead of storing
    // return new Observable(observer => {
    //   observer.next({ success: true, message: 'Loan creation disabled (mocked)' });
    //   observer.complete();
    // });
  }


  // 📌 Get all loans
  getLoans(): Observable<LoanTakenResponseDto[]> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<LoanTakenResponseDto[]>>(`${this.baseUrl}/society?societyId=1`, { headers }).pipe(
      tap(res => console.log('Raw loan API response:', res)),
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch loans');
      }),
      catchError(err => {
        console.error('Error fetching loans:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch loans'));
      })
    );
  }

  // 📌 Get loans by member ID
  getLoansByMember(memberId: number): Observable<LoanTakenResponseDto[]> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<LoanTakenResponseDto[]>>(`${this.baseUrl}/member?memberId=${memberId}`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch member loans');
      }),
      catchError(err => {
        console.error('Error fetching member loans:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch member loans'));
      })
    );
  }

  // 📌 Get loan by ID
  getLoanById(id: number): Observable<LoanTakenResponseDto> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<LoanTakenResponseDto>>(`${this.baseUrl}/${id}`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch loan');
      }),
      catchError(err => {
        console.error(`Error fetching loan ${id}:`, err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch loan'));
      })
    );
  }

  // 📌 Get society limits
  getSocietyLimits(): Observable<SocietyLimitDto> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<SocietyLimitDto>>(this.societyUrl, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch society limits');
      }),
      catchError(err => {
        console.error('Error fetching society limits:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch society limits'));
      })
    );
  }
}