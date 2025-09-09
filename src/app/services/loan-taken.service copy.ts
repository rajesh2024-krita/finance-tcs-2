import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// ------------ DTO Interfaces ------------

export interface LoanTakenCreateDto {
  loanNo: string;
  loanDate: string;
  loanType: string;
  customType?: string;
  memberNo: string;
  loanAmount: number;
  previousLoan: number;
  installments: number;
  purpose?: string;
  authorizedBy?: string;
  paymentMode: string;
  bank?: string;
  chequeNo?: string;
  chequeDate?: string | null;
}

export interface LoanTakenResponseDto {
  id: number;
  loanNo: string;
  loanDate: string;
  loanType: string;
  memberNo: string;
  loanAmount: number;
  netLoan: number;
  installmentAmount: number;
  newLoanShare: number;
  payAmount: number;
  createdAt: string;
}

export interface MemberDto {
  id: number;
  memNo: string;
  name: string;
  share: number;
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
    share: number; // This is a string in the API response
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

// Add to your DTO Interfaces section
export interface SocietyLimitDto {
  id: number;
  name: string;
  limits: {
    loan: number;
    emergency: number;
    festival: number;
    las: number;
    laFdr: number;
  };
  createdAt: string;
  updatedAt: string;
  tabs: any;
}

// ------------ Service ------------

@Injectable({
  providedIn: 'root'
})
export class LoanTakenService {
  private readonly baseUrl = 'https://fintcsapi-1.onrender.com/api/LoanTaken';

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

  // 📌 Get all members (for dropdown)
  getMembers(): Observable<MemberDto[]> {
    const headers = this.getHeaders();
    const url = `https://fintcsapi-1.onrender.com/api/Member`;

    return this.http.get<ApiResponse<MemberDto[]>>(url, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        console.log('res == ', res.data)
        throw new Error(res.message || 'Failed to fetch members');
      }),
      catchError(err => {
        console.error('Error fetching members:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch members'));
      })
    );
  }

  // 📌 Create new loan
  createLoan(dto: LoanTakenCreateDto): Observable<LoanTakenResponseDto> {
    const headers = this.getHeaders();

    return this.http.post<ApiResponse<LoanTakenResponseDto>>(this.baseUrl, dto, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to create loan');
      }),
      catchError(err => {
        console.error('Error creating loan:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to create loan'));
      })
    );
  }

  // 📌 Get all loans
  getLoans(): Observable<LoanTakenResponseDto[]> {
    const headers = this.getHeaders();

    return this.http.get<ApiResponse<LoanTakenResponseDto[]>>(this.baseUrl, { headers }).pipe(
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

  // Add to the LoanTakenService class
  getSocietyLimits(): Observable<SocietyLimitDto> {
    const headers = this.getHeaders();
    const url = `https://fintcsapi-1.onrender.com/api/Society`;

    return this.http.get<ApiResponse<SocietyLimitDto>>(url, { headers }).pipe(
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
