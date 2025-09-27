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

/** Member model (aligned with backend schema) */
export interface Member {
  id?: string;
  societyId?: string;
  memNo?: string;
  memberNo?: string;
  name: string;
  fhName: string;
  officeAddress?: string;
  city?: string;
  mobile2?: string;
  email2?: string;
  pincode?: string;
  phoneOffice?: string;
  branch?: string;
  phoneRes?: string;
  mobile?: string;
  designation?: string;
  residenceAddress?: string;
  dob?: Date | string;
  dojSociety?: Date | string;
  // dojOrg?: Date | string;
  dor?: Date | string;
  email?: string;
  nominee?: string;
  nomineeRelation?: string;
  share?: number;
  cdAmount?: number;
  status?: string;
  payableAt?: string;
  bankName?: string;        // 👈 moved outside
  accountNumber?: string;   // 👈 moved outside
  createdAt?: string;
  updatedAt?: string;
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

  /** ---------------- CRUD API Calls ---------------- */

  getAllMembers(societyId: string): Observable<Member[]> {
    console.log('Fetching members for societyId:', societyId);
    return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}?societyId=${societyId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('API Response:', response);
          return response.data;
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  getMemberById(id: string): Observable<Member> {
    return this.http.get<ApiResponse<Member>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createMember(member: Member): Observable<Member> {
console.log('member === 1  == ', member)
    const memberData = this.prepareMemberData(member, 'create');
    return this.http.post<ApiResponse<Member>>(`${this.apiUrl}?societyId=${1}`, memberData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateMember(id: string, member: Member): Observable<Member> {
    console.log('member === 2  == ', member)
    const memberData = this.prepareMemberData(member, 'update');
    return this.http.put<ApiResponse<Member>>(`${this.apiUrl}/${id}`, memberData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /** ---------------- Helper Methods ---------------- */

  /** Prepare data for API (transform dates, handle banking details) */
  private prepareMemberData(member: Member, mode: 'create' | 'update'): any {
  const data: any = {
    name: member.name,
    fhName: member.fhName,
    officeAddress: member.officeAddress || '',
    city: member.city || '',
    phoneOffice: member.phoneOffice || '',
    branch: member.branch || '',
    phoneRes: member.phoneRes || '',
    mobile: member.mobile || '',
    mobile2: member.mobile2 || '',
    email2: member.email2 || '',
    pincode: member.pincode || '',
    designation: member.designation || '',
    residenceAddress: member.residenceAddress || '',
    dob: this.formatDate(member.dob),
    dojSociety: this.formatDate(member.dojSociety),
    // dojOrg: this.formatDate(member.dojOrg),
    dor: this.formatDate(member.dor) || null,
    email: member.email || '',
    nominee: member.nominee || '',
    nomineeRelation: member.nomineeRelation || '',
    status: member.status || 'Active',
    cdAmount: member.cdAmount?.toString() || '0',
    share: member.share?.toString() || '0',

    // 👇 directly included at root
    bankName: member.bankName || '',
    accountNumber: member.accountNumber || '',
    payableAt: member.payableAt || ''
  };

  if (mode === 'create' && member.societyId) {
    data.societyId = member.societyId;
  }

  return data;
}


  /** Format date for API */
  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    if (typeof date === 'string') {
      // If it's already in ISO format, return as is
      if (date.includes('T')) {
        return date;
      }
      // If it's a date string without time, add time component
      return new Date(date + 'T00:00:00.000Z').toISOString();
    }
    
    return '';
  }

  /** Map API response to Member interface */
  mapApiResponseToMember(apiData: any): Member {
  return {
    id: apiData.id,
    societyId: apiData.societyId,
    memNo: apiData.memNo,
    memberNo: apiData.memNo, // Use memNo as memberNo for frontend
    name: apiData.name,
    fhName: apiData.fhName,
    officeAddress: apiData.officeAddress,
    city: apiData.city,
    mobile2: apiData.mobile2,
    email2: apiData.email2,
    pincode: apiData.pincode,
    phoneOffice: apiData.phoneOffice,
    branch: apiData.branch,
    phoneRes: apiData.phoneRes,
    mobile: apiData.mobile,
    designation: apiData.designation,
    residenceAddress: apiData.residenceAddress,
    dob: apiData.dob,
    dojSociety: apiData.dojSociety,
    dojOrg: apiData.dojOrg,
    dor: apiData.dor,
    email: apiData.email,
    nominee: apiData.nominee,
    nomineeRelation: apiData.nomineeRelation,

    // ✅ Direct fields from API (flattened)
    bankName: apiData.bankName || '',
    accountNumber: apiData.accountNumber || '',
    payableAt: apiData.payableAt || '',
    share: apiData.share || 0,

    cdAmount: apiData.cdAmount,
    status: apiData.status,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt
  } as Member;
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
        case 400: 
          errorMessage = 'Bad Request - Please check your input data';
          if (error.error?.errors) {
            errorMessage += ': ' + Object.values(error.error.errors).join(', ');
          }
          break;
        case 403: errorMessage = 'Forbidden'; break;
        case 404: errorMessage = 'Not Found'; break;
        case 409: errorMessage = 'Conflict - Member already exists'; break;
        case 500: errorMessage = 'Internal Server Error'; break;
        default: errorMessage = `Server Error: ${error.status}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}