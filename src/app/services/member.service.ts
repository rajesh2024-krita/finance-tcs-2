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
  memberNo?: string;
  memNo?: string; // Alternative member number field
  name: string;
  fhName?: string;
  dateOfBirth?: Date | string;
  dob?: Date | string; // Alternative date of birth field
  mobile?: string;
  email?: string;
  designation?: string;
  doj?: Date | string;
  status?: string;
  officeAddress?: string;
  residenceAddress?: string;
  city?: string;
  phoneOffice?: string;
  phoneRes?: string;
  phoneResidence?: string;
  shareAmount?: number;
  cdAmount?: number;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  accountHolderName?: string;
  nominee?: string;
  nomineeRelation?: string;
  // Add other properties as needed
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

    console.error('Full API Error:', error);

    if (error.status === 401) {
      errorMessage = 'Unauthorized - Please login again.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Handle server errors
      switch (error.status) {
        case 0:
          errorMessage = 'Network Error - Please check your connection';
          break;
        case 400:
          errorMessage = 'Bad Request - Invalid data provided';
          if (error.error && typeof error.error === 'object') {
            const validationErrors = Object.values(error.error).flat();
            if (validationErrors.length > 0) {
              errorMessage += `: ${validationErrors.join(', ')}`;
            }
          }
          break;
        case 403:
          errorMessage = 'Forbidden - Access denied';
          break;
        case 404:
          errorMessage = 'Not Found - Resource does not exist';
          break;
        case 409:
          errorMessage = 'Conflict - Member number already exists';
          break;
        case 500:
          errorMessage = 'Internal Server Error - Please try again later';
          break;
        default:
          errorMessage = `Server Error (${error.status}): ${error.message || 'Unknown error'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}