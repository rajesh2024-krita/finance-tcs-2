// src/app/services/society.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

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

// 🔹 LoanType schema for frontend
export interface LoanTypeDto {
  LoanType: string;
  CompulsoryDeposit: number;
  OptionalDeposit: number;
  Share: number;
  Limit: number;
  Interest: number;
  XTimes: number;
}

export interface SocietyDto {
  id: number;
  societyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;

  // Flat structure
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

  // 🔹 New: LoanTypes array
  loanTypes: LoanTypeDto[];

  // Original tabs structure
  tabs?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocietyDto {
  societyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;

  // Interest rates
  dividend: number;
  overdraft: number;
  currentDeposit: number;
  loan: number;
  emergencyLoan: number;
  las: number;

  // Limits
  shareLimit: number;
  loanLimit: number;
  emergencyLoanLimit: number;

  chBounceCharge: string;
  targetDropdown: string;
  dropdownArray: string[];

  // 🔹 New: LoanTypes array
  loanTypes: LoanTypeDto[];
}

export interface SocietyEditPending {
  id: number;
  societyId: number;
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
  chequeBounceCharge: number;
  chequeReturnCharge: number;
  dropdownArray: string[];
  targetDropdown: string;
  cash: number;
  bonus: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: Date;
  requestedByUserId: number;
  requestedByUserName: string;
  approvals: SocietyEditApproval[];
}

export interface SocietyEditApproval {
  id: number;
  pendingEditId: number;
  userId: number;
  userName: string;
  approved: boolean;
  approvedAt?: Date;
  comments?: string;
}

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
  ) {}

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

    return this.http.get<ApiResponse<SocietyDto>>(this.baseUrl, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          const society = response.data;
          this.currentSocietySubject.next(society);
          console.log("society data in service = ", society );
          return society;
        } else {
          throw new Error(response.message || 'Failed to fetch society data');
        }
      }),
      catchError(error => {
        console.error('Error fetching society:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch society data'));
      })
    );
  }

  // Get specific society by ID (Super Admin only)
  getSocietyById(societyId: number): Observable<SocietyDto> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${societyId}`;

    return this.http.get<ApiResponse<SocietyDto>>(url, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch society data');
        }
      }),
      catchError(error => {
        console.error('Error fetching society by ID:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch society data'));
      })
    );
  }

  // Get all societies (Super Admin only)
  getSocieties(): Observable<SocietyDto[]> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/all`;

    return this.http.get<ApiResponse<SocietyDto[]>>(url, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch societies');
        }
      }),
      catchError(error => {
        console.error('Error fetching societies:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch societies'));
      })
    );
  }

  // Create new society (Super Admin only)
  createSociety(createSocietyDto: CreateSocietyDto): Observable<SocietyDto> {
    const headers = this.getHeaders();

    return this.http.post<ApiResponse<SocietyDto>>(this.baseUrl, createSocietyDto, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create society');
        }
      }),
      catchError(error => {
        console.error('Error creating society:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create society'));
      })
    );
  }

  // Update society
  updateSociety(societyId: number, updateData: Partial<CreateSocietyDto>): Observable<SocietyDto> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}`;

    // Ensure dropdownArray and loanTypes formatted properly
    const formattedData = {
      ...updateData,
      dropdownArray: Array.isArray(updateData.dropdownArray)
        ? JSON.stringify(updateData.dropdownArray)
        : updateData.dropdownArray || '[]',
      loanTypes: updateData.loanTypes || []   // always send loanTypes array
    };

    return this.http.put<ApiResponse<SocietyDto>>(url, formattedData, { headers }).pipe(
      map(response => {
        if (response.success) {
          const updatedSociety = response.data || (updateData as SocietyDto);

          const currentSociety = this.currentSocietySubject.value;
          if (currentSociety && currentSociety.id === societyId) {
            this.currentSocietySubject.next(updatedSociety);
          }

          return updatedSociety;
        } else {
          throw new Error(response.message || 'Failed to update society');
        }
      }),
      catchError(error => {
        console.error('Error updating society:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update society'));
      })
    );
  }

  // Get pending edits for society
  getPendingEdits(): Observable<SocietyEditPending[]> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/pending-edits`;

    return this.http.get<ApiResponse<SocietyEditPending[]>>(url, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch pending edits');
        }
      }),
      catchError(error => {
        console.error('Error fetching pending edits:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch pending edits'));
      })
    );
  }

  // Get specific pending edit
  getPendingEdit(editId: number): Observable<SocietyEditPending> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/pending-edits/${editId}`;

    return this.http.get<ApiResponse<SocietyEditPending>>(url, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch pending edit');
        }
      }),
      catchError(error => {
        console.error('Error fetching pending edit:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch pending edit'));
      })
    );
  }

  // Approve/Reject pending edit
  reviewPendingEdit(editId: number, approved: boolean, comments?: string): Observable<SocietyEditApproval> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/pending-edits/${editId}/review`;

    return this.http.post<ApiResponse<SocietyEditApproval>>(url, { approved, comments }, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to review pending edit');
        }
      }),
      catchError(error => {
        console.error('Error reviewing pending edit:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to review pending edit'));
      })
    );
  }

  // Delete society (Super Admin only)
  deleteSociety(societyId: number): Observable<void> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${societyId}`;

    return this.http.delete<ApiResponse<void>>(url, { headers }).pipe(
      map(response => {
        if (response.success) {
          const currentSociety = this.currentSocietySubject.value;
          if (currentSociety && currentSociety.id === societyId) {
            this.currentSocietySubject.next(null);
          }
          return;
        } else {
          throw new Error(response.message || 'Failed to delete society');
        }
      }),
      catchError(error => {
        console.error('Error deleting society:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete society'));
      })
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
}


// // src/app/services/society.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, BehaviorSubject, throwError } from 'rxjs';
// import { catchError, map, tap } from 'rxjs/operators';
// import { AuthService } from './auth.service';

// export interface InterestRatesDto {
//   dividend: number;
//   od: number;
//   cd: number;
//   loan: number;
//   emergencyLoan: number;
//   las: number;
// }

// export interface LimitsDto {
//   share: number;
//   loan: number;
//   emergencyLoan: number;
// }

// export interface SocietyTabsDto {
//   interest: InterestRatesDto;
//   limit: LimitsDto;
// }

// export interface SocietyDto {
//   id: number;
//   societyName: string;
//   registrationNumber: string;
//   address: string;
//   city: string;
//   phone: string;
//   fax?: string;
//   email: string;
//   website?: string;
  
//   // Flat structure for frontend
//   dividend: number;
//   overdraft: number;
//   currentDeposit: number;
//   loan: number;
//   emergencyLoan: number;
//   las: number;
//   shareLimit: number;
//   loanLimit: number;
//   emergencyLoanLimit: number;
  
//   chBounceCharge: string;
//   targetDropdown: string;
//   dropdownArray: string[];
  
//   // Original tabs structure
//   tabs?: string;
  
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface CreateSocietyDto {
//   societyName: string;
//   registrationNumber: string;
//   address: string;
//   city: string;
//   phone: string;
//   fax?: string;
//   email: string;
//   website?: string;
  
//   // Interest rates
//   dividend: number;
//   overdraft: number;
//   currentDeposit: number;
//   loan: number;
//   emergencyLoan: number;
//   las: number;
  
//   // Limits
//   shareLimit: number;
//   loanLimit: number;
//   emergencyLoanLimit: number;
  
//   chBounceCharge: string;
//   targetDropdown: string;
//   dropdownArray: string[];
// }

// export interface SocietyEditPending {
//   id: number;
//   societyId: number;
//   societyName: string;
//   registrationNumber: string;
//   address: string;
//   city: string;
//   phone: string;
//   fax?: string;
//   email: string;
//   website?: string;
//   dividend: number;
//   overdraft: number;
//   currentDeposit: number;
//   loan: number;
//   emergencyLoan: number;
//   las: number;
//   shareLimit: number;
//   loanLimit: number;
//   emergencyLoanLimit: number;
//   chequeBounceCharge: number;
//   chequeReturnCharge: number;
//   dropdownArray: string[];
//   targetDropdown: string;
//   cash: number;
//   bonus: number;
//   status: 'Pending' | 'Approved' | 'Rejected';
//   requestedAt: Date;
//   requestedByUserId: number;
//   requestedByUserName: string;
//   approvals: SocietyEditApproval[];
// }

// export interface SocietyEditApproval {
//   id: number;
//   pendingEditId: number;
//   userId: number;
//   userName: string;
//   approved: boolean;
//   approvedAt?: Date;
//   comments?: string;
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data?: T;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class SocietyService {
//   private readonly baseUrl = 'https://1d4tg1qv-5000.inc1.devtunnels.ms/api/Society';
//   private currentSocietySubject = new BehaviorSubject<SocietyDto | null>(null);
  
//   public currentSociety$ = this.currentSocietySubject.asObservable();

//   constructor(
//     private http: HttpClient,
//     private authService: AuthService
//   ) {}

//   private getHeaders(): HttpHeaders {
//     const token = this.authService.getAuthToken();
//     return new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     });
//   }

//   // Get current user's society
//   getSociety(): Observable<SocietyDto> {
//     const headers = this.getHeaders();
    
//     return this.http.get<ApiResponse<SocietyDto>>(this.baseUrl, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           const society = response.data;
//           this.currentSocietySubject.next(society);
//           console.log("society data in service = ", society );
          
//           return society;
//         } else {
//           throw new Error(response.message || 'Failed to fetch society data');
//         }
//       }),
//       catchError(error => {
//         console.error('Error fetching society:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to fetch society data'));
//       })
//     );
//   }

//   // Get specific society by ID (Super Admin only)
//   getSocietyById(societyId: number): Observable<SocietyDto> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/${societyId}`;
    
//     return this.http.get<ApiResponse<SocietyDto>>(url, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to fetch society data');
//         }
//       }),
//       catchError(error => {
//         console.error('Error fetching society by ID:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to fetch society data'));
//       })
//     );
//   }

//   // Get all societies (Super Admin only)
//   getSocieties(): Observable<SocietyDto[]> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/all`;
    
//     return this.http.get<ApiResponse<SocietyDto[]>>(url, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to fetch societies');
//         }
//       }),
//       catchError(error => {
//         console.error('Error fetching societies:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to fetch societies'));
//       })
//     );
//   }

//   // Create new society (Super Admin only)
//   createSociety(createSocietyDto: CreateSocietyDto): Observable<SocietyDto> {
//     const headers = this.getHeaders();
    
//     return this.http.post<ApiResponse<SocietyDto>>(this.baseUrl, createSocietyDto, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to create society');
//         }
//       }),
//       catchError(error => {
//         console.error('Error creating society:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to create society'));
//       })
//     );
//   }

//   // Update society
//   updateSociety(societyId: number, updateData: Partial<CreateSocietyDto>): Observable<SocietyDto> {
//     const headers = this.getHeaders();
//     // const url = `${this.baseUrl}/${societyId}`;
//     const url = `${this.baseUrl}`;
    
//     // Ensure dropdownArray is properly formatted as string
//     const formattedData = {
//       ...updateData,
//       dropdownArray: Array.isArray(updateData.dropdownArray) 
//         ? JSON.stringify(updateData.dropdownArray) 
//         : updateData.dropdownArray || '[]'
//     };
    
//     return this.http.put<ApiResponse<SocietyDto>>(url, formattedData, { headers }).pipe(
//       map(response => {
//         if (response.success) {
//           // If backend didn’t send data, just return the same updateData we sent
//           const updatedSociety = response.data || (updateData as SocietyDto);

//           const currentSociety = this.currentSocietySubject.value;
//           if (currentSociety && currentSociety.id === societyId) {
//             this.currentSocietySubject.next(updatedSociety);
//           }

//           return updatedSociety;
//         } else {
//           throw new Error(response.message || 'Failed to update society');
//         }
//       }),
//       catchError(error => {
//         console.error('Error updating society:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to update society'));
//       })
//     );

//   }

//   // Get pending edits for society
//   getPendingEdits(): Observable<SocietyEditPending[]> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/pending-edits`;
    
//     return this.http.get<ApiResponse<SocietyEditPending[]>>(url, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to fetch pending edits');
//         }
//       }),
//       catchError(error => {
//         console.error('Error fetching pending edits:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to fetch pending edits'));
//       })
//     );
//   }

//   // Get specific pending edit
//   getPendingEdit(editId: number): Observable<SocietyEditPending> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/pending-edits/${editId}`;
    
//     return this.http.get<ApiResponse<SocietyEditPending>>(url, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to fetch pending edit');
//         }
//       }),
//       catchError(error => {
//         console.error('Error fetching pending edit:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to fetch pending edit'));
//       })
//     );
//   }

//   // Approve/Reject pending edit
//   reviewPendingEdit(editId: number, approved: boolean, comments?: string): Observable<SocietyEditApproval> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/pending-edits/${editId}/review`;
    
//     return this.http.post<ApiResponse<SocietyEditApproval>>(url, { approved, comments }, { headers }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.message || 'Failed to review pending edit');
//         }
//       }),
//       catchError(error => {
//         console.error('Error reviewing pending edit:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to review pending edit'));
//       })
//     );
//   }

//   // Delete society (Super Admin only)
//   deleteSociety(societyId: number): Observable<void> {
//     const headers = this.getHeaders();
//     const url = `${this.baseUrl}/${societyId}`;
    
//     return this.http.delete<ApiResponse<void>>(url, { headers }).pipe(
//       map(response => {
//         if (response.success) {
//           // Remove from current society if it's the one being deleted
//           const currentSociety = this.currentSocietySubject.value;
//           if (currentSociety && currentSociety.id === societyId) {
//             this.currentSocietySubject.next(null);
//           }
//           return;
//         } else {
//           throw new Error(response.message || 'Failed to delete society');
//         }
//       }),
//       catchError(error => {
//         console.error('Error deleting society:', error);
//         return throwError(() => new Error(error.error?.message || 'Failed to delete society'));
//       })
//     );
//   }

//   // Update current society in subject
//   setCurrentSociety(society: SocietyDto) {
//     this.currentSocietySubject.next(society);
//   }

//   // Get current society from subject
//   getCurrentSociety(): SocietyDto | null {
//     return this.currentSocietySubject.value;
//   }

//   // Clear current society
//   clearCurrentSociety() {
//     this.currentSocietySubject.next(null);
//   }
// }