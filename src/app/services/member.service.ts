import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface BankingDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
}

export interface Member {
  id?: number;
  memberNo: string;
  name: string;
  fhName: string;
  dateOfBirth?: Date | string;
  mobile?: string;
  email?: string;
  designation?: string;
  dojJob?: Date | string;
  doRetirement?: Date | string;
  branch?: string;
  dojSociety?: Date | string;
  officeAddress?: string;
  residenceAddress?: string;
  city?: string;
  phoneOffice?: string;
  phoneResidence?: string;
  nominee?: string;
  nomineeRelation?: string;
  shareAmount: number;
  cdAmount: number;
  bankName?: string;
  payableAt?: string;
  accountNo?: string;
  status?: string;
  date?: Date | string;
  photoPath?: string;
  signaturePath?: string;
  shareDeduction?: number;
  withdrawal?: number;
  gLoanInstalment?: number;
  eLoanInstalment?: number;
  createdDate?: Date | string;
  updatedDate?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'https://1d4tg1qv-5000.inc1.devtunnels.ms/api/Member';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /** Get Auth Headers */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /** CRUD API Calls */
  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(retry(2), catchError(this.handleError));
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createMember(member: Member): Observable<Member> {
    const memberData = this.prepareMemberData(member);
    return this.http.post<Member>(this.apiUrl, memberData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateMember(id: number, member: Member): Observable<Member> {
    const memberData = this.prepareMemberData(member);
    return this.http.put<Member>(`${this.apiUrl}/${id}`, memberData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /** Data Transformation for API */
  private prepareMemberData(member: Member): any {
    const data = { ...member };

    // Convert Date objects to ISO string
    ['dob', 'dojSociety', 'dojOrg', 'dor'].forEach(field => {
      const value = (data as any)[field];
      if (value instanceof Date) {
        (data as any)[field] = value.toISOString();
      }
    });

    return data;
  }

  /** Error Handling */
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred';
    if (error.status === 401) {
      errorMessage = 'Unauthorized - Please login again.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400: errorMessage = 'Bad Request'; break;
        case 403: errorMessage = 'Forbidden'; break;
        case 404: errorMessage = 'Not Found'; break;
        case 409: errorMessage = 'Conflict - Member number exists'; break;
        case 500: errorMessage = 'Internal Server Error'; break;
        default: errorMessage = `Server Error: ${error.status}`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}