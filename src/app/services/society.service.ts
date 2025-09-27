// src/app/services/society.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// 🔹 Bank account structure
export interface BankAccountDto {
  id: string;
  societyId: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifsc: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string | null;
  society?: SocietyDto | null;
}

// 🔹 Loan type structure
export interface LoanTypeDto {
  loanTypeId: string;
  societyId: string;
  name: string;
  interestPercent: number;
  limitAmount: number;
  compulsoryDeposit: number;
  optionalDeposit: number;
  shareAmount: number;
  xTimes: number;
  createdAt: string;
  updatedAt?: string | null;
  society?: SocietyDto | null;
}

// 🔹 Member structure
export interface MemberDto {
  id: string;
  societyId: string;
  name: string;
  fhName: string;
  dob: string;
  dojSociety: string;
  dor: string;
  designation: string;
  email: string;
  email2?: string;
  mobile: string;
  mobile2?: string;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
  cdAmount?: string;
  share?: string;
  nominee?: string;
  nomineeRelation?: string;
  officeAddress?: string;
  residenceAddress?: string;
  payableAt?: string;
  phoneOffice?: string;
  phoneRes?: string;
  city?: string;
  pincode?: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  society?: SocietyDto | null;
}

// 🔹 Society structure including arrays
export interface SocietyDto {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  chequeBounceCharge: number;

  // Arrays
  bankAccounts: BankAccountDto[];
  loanTypes: LoanTypeDto[];
  members: MemberDto[];

  createdAt: string;
  updatedAt?: string | null;
}

// 🔹 DTO for creating/updating society
export interface CreateSocietyDto {
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  chequeBounceCharge: number;

  bankAccounts?: BankAccountDto[];
  loanTypes?: LoanTypeDto[];
  members?: MemberDto[];
}

// 🔹 Pending edit structures
export interface SocietyEditApproval {
  id: number;
  pendingEditId: number;
  userId: number;
  userName: string;
  approved: boolean;
  approvedAt?: Date;
  comments?: string;
}

export interface SocietyEditPending {
  id: number;
  societyId: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  chequeBounceCharge: number;
  bankAccounts?: BankAccountDto[];
  loanTypes?: LoanTypeDto[];
  members?: MemberDto[];
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: Date;
  requestedByUserId: number;
  requestedByUserName: string;
  approvals: SocietyEditApproval[];
}

// 🔹 Generic API response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class SocietyService {
  private readonly baseUrl = 'https://1d4tg1qv-5000.inc1.devtunnels.ms/api/Society';
  private currentSocietySubject = new BehaviorSubject<SocietyDto | null>(null);
  public currentSociety$ = this.currentSocietySubject.asObservable();

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

  // Get current user's society
  getSociety(): Observable<SocietyDto> {
    const headers = this.getHeaders();
    return this.http.get<ApiResponse<SocietyDto[]>>(this.baseUrl, { headers }).pipe(
      map(response => {
        if (response.success && response.data && response.data.length > 0) {
          const firstSociety = response.data[0]; // 👈 take index 0
          this.currentSocietySubject.next(firstSociety);
          return firstSociety;
        }
        throw new Error(response.message || 'No society data found');
      }),
      catchError(error =>
        throwError(() => new Error(error.error?.message || 'Failed to fetch society data'))
      )
    );
  }


  // Get specific society by ID
  getSocietyById(societyId: string): Observable<SocietyDto> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${societyId}`;
    return this.http.get<ApiResponse<SocietyDto>>(url, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch society by ID');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch society by ID')))
    );
  }

  // Create new society
  createSociety(createSocietyDto: CreateSocietyDto): Observable<SocietyDto> {
    const headers = this.getHeaders();
    return this.http.post<ApiResponse<SocietyDto>>(this.baseUrl, createSocietyDto, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to create society');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to create society')))
    );
  }

  // Update society - FIXED VERSION
  // inside SocietyService
  updateSociety(societyId: string, updateData: Partial<CreateSocietyDto>): Observable<SocietyDto> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${societyId}`;

    const formattedData: CreateSocietyDto = {
      name: updateData.name || '',
      registrationNumber: updateData.registrationNumber || '',
      address: updateData.address || '',
      city: updateData.city || '',
      phone: updateData.phone || '',
      fax: updateData.fax || undefined,
      email: updateData.email || '',
      website: updateData.website || undefined,
      chequeBounceCharge: updateData.chequeBounceCharge || 0,
      bankAccounts: updateData.bankAccounts || [],
      // 🚨 removed loanTypes from here
      members: updateData.members || []
    };

    return this.http.put<ApiResponse<SocietyDto>>(url, formattedData, { headers }).pipe(
      map(res => {
        if (res.success && res.data) {
          const updatedSociety = res.data;
          if (this.currentSocietySubject.value?.id === societyId) {
            this.currentSocietySubject.next(updatedSociety);
          }
          return updatedSociety;
        }
        throw new Error(res.message || 'Failed to update society');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to update society')))
    );
  }


  // Delete society
  deleteSociety(societyId: string): Observable<void> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${societyId}`;
    return this.http.delete<ApiResponse<void>>(url, { headers }).pipe(
      map(res => {
        if (res.success && this.currentSocietySubject.value?.id === societyId) {
          this.currentSocietySubject.next(null);
        }
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to delete society')))
    );
  }

  // Pending edits
  getPendingEdits(): Observable<SocietyEditPending[]> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/pending-edits`;
    return this.http.get<ApiResponse<SocietyEditPending[]>>(url, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to fetch pending edits');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch pending edits')))
    );
  }

  reviewPendingEdit(editId: number, approved: boolean, comments?: string): Observable<SocietyEditApproval> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/pending-edits/${editId}/review`;
    return this.http.post<ApiResponse<SocietyEditApproval>>(url, { approved, comments }, { headers }).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Failed to review pending edit');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to review pending edit')))
    );
  }

  // State management
  setCurrentSociety(society: SocietyDto) {
    this.currentSocietySubject.next(society);
  }

  getCurrentSociety(): SocietyDto | null {
    return this.currentSocietySubject.value;
  }

  clearCurrentSociety() {
    this.currentSocietySubject.next(null);
  }

  // Helper method to generate IDs
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }
}