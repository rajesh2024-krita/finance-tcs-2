import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

/** Banking details model */
export interface BankingDetails {
  bankName: string;
  accountNumber: string;
  payableAt: string;
  share: number;
}

/** Member model (aligned with backend MemberResponseDto) */
export interface Member {
  id?: number;
  memNo: string;
  memberNo?: string; // alias for frontend
  name: string;
  fhName: string;
  officeAddress?: string;
  city?: string;
  mobile2?:string;
  email2?:string;
  pincode:string;
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
  bankingDetails: BankingDetails;

  // Aliases for templates
  status?: string;
  shareAmount?: number;    // map from bankingDetails.share
  cdAmount?: number;
  bankName?: string;       // map from bankingDetails.bankName
  accountNo?: string;      // map from bankingDetails.accountNumber
  payableAt?: string;    // map from bankingDetails.payableAt
  accountHolderName?: string; // optional if used in template
  dateOfBirth?: Date | string; // alias for dob
  dojJob?: Date | string;      // alias for dojOrg
  doRetirement?: Date | string;// alias for dor
}


/** API wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'http://localhost:5000/api/Member';
  // private apiUrl = 'https://fintcsapi-1.onrender.com/api/Member';

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

  /** ---------------- CRUD API Calls ---------------- */

  getAllMembers(): Observable<Member[]> {
    return this.http.get<ApiResponse<Member[]>>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        retry(2),
        catchError(this.handleError)
      );
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<ApiResponse<Member>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // createMember(member: Member): Observable<Member> {
  //   const memberData = this.prepareMemberData(member);
  //   return this.http.post<ApiResponse<Member>>(this.apiUrl, memberData, { headers: this.getHeaders() })
  //     .pipe(
  //       map(response => response.data),
  //       catchError(this.handleError)
  //     );
  // }

  createMember(member: Member): Observable<Member> {
    const memberData = this.prepareMemberData(member);

    // 🔹 Ensure date fields are in proper ISO string format
    memberData.dob = member.dob ? new Date(member.dob).toISOString() : null;
    memberData.dojSociety = member.dojSociety ? new Date(member.dojSociety).toISOString() : null;
    memberData.dojOrg = member.dojOrg
      ? new Date(member.dojOrg).toISOString()
      : (member.dojSociety ? new Date(member.dojSociety).toISOString() : null);
    memberData.dor = member.dor
      ? new Date(member.dor).toISOString()
      : new Date("2040-12-31").toISOString(); // fallback default

    // 🔹 Fix share (ensure string)
    if (member.bankingDetails) {
      memberData.bankingDetails = {
        ...member.bankingDetails,
        share: member.bankingDetails.share?.toString()
      };
    }

    return this.http.post<ApiResponse<Member>>(this.apiUrl, memberData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }


  updateMember(id: number, member: Member): Observable<Member> {
    const memberData = this.prepareMemberData(member);
    console.log("memberData : ", memberData);
    if (member.bankingDetails) {
      memberData.bankingDetails = {
        ...member.bankingDetails,
        share: member.bankingDetails.share?.toString()
      };
    }
    memberData.cdAmount = member.cdAmount?.toString() || "0";
    
    return this.http.put<ApiResponse<Member>>(`${this.apiUrl}/${id}`, memberData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /** ---------------- Extra API Calls ---------------- */

  /** Approve pending changes */
  approveChanges(id: number): Observable<Member> {
    return this.http.post<ApiResponse<Member>>(`${this.apiUrl}/${id}/approve-changes`, {}, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /** Get members with pending changes */
  getPendingChanges(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/pending-changes`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /** ---------------- Helper Methods ---------------- */

  /** Prepare data for API (transform dates, flatten structure) */
  private prepareMemberData(member: Member): any {
    return {
      name: member.name,
      fhName: member.fhName,
      officeAddress: member.officeAddress,
      city: member.city,
      cdAmount: member.cdAmount?.toString() || "0",
      phoneOffice: member.phoneOffice,
      branch: member.branch,
      status: member.status,
      phoneRes: member.phoneRes,
      mobile: member.mobile,
      mobile2:member.mobile2,
      email2:member.email2,
      pincode:member.pincode,
      designation: member.designation,
      residenceAddress: member.residenceAddress,
      dob: member.dob instanceof Date ? member.dob.toISOString() : member.dob,
      dojSociety: member.dojSociety instanceof Date ? member.dojSociety.toISOString() : member.dojSociety,
      email: member.email,
      dojOrg: member.dojOrg instanceof Date ? member.dojOrg.toISOString() : member.dojOrg,
      dor: member.dor instanceof Date ? member.dor.toISOString() : member.dor,
      nominee: member.nominee,
      nomineeRelation: member.nomineeRelation,
      bankingDetails: member.bankingDetails
    };
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
