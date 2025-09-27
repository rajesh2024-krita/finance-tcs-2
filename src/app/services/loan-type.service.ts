// src/app/services/loan-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoanTypeDto } from './society.service'; // reuse interface

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

@Injectable({
    providedIn: 'root'
})
export class LoanTypeService {
    private readonly baseUrl = 'https://1d4tg1qv-5000.inc1.devtunnels.ms/api/LoanType';

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
    // Create Loan Type
    createLoanType(dto: LoanTypeDto): Observable<LoanTypeDto> {
        const headers = this.getHeaders();

        // API expects { dto: {...} }
        const requestBody = { dto };
        console.log('loan types requestBody ===', dto);

        return this.http.post<ApiResponse<LoanTypeDto>>(this.baseUrl, dto, { headers }).pipe(
            map(res => {
                if (res.success && res.data) return res.data;
                throw new Error(res.message || 'Failed to create loan type');
            }),
            catchError(err =>
                throwError(() => new Error(err.error?.message || 'Failed to create loan type'))
            )
        );
    }

    // Update the updateLoanType method
    updateLoanType(loanTypeId: string, dto: LoanTypeDto): Observable<LoanTypeDto> {
        const headers = this.getHeaders();
        const url = `${this.baseUrl}/${loanTypeId}`;

        // Wrap the dto in a 'dto' property
        const requestBody = { dto };

        console.log('requestBody === ', dto)

        return this.http.put<ApiResponse<LoanTypeDto>>(url, dto, { headers }).pipe(
            map(res => {
                if (res.success && res.data) return res.data;
                throw new Error(res.message || 'Failed to update loan type');
            }),
            catchError(err => throwError(() => new Error(err.error?.message || 'Failed to update loan type')))
        );
    }

    // Delete Loan Type
    deleteLoanType(loanTypeId: string): Observable<void> {
        const headers = this.getHeaders();
        const url = `${this.baseUrl}/${loanTypeId}`;
        return this.http.delete<ApiResponse<void>>(url, { headers }).pipe(
            map(res => {
                if (!res.success) throw new Error(res.message || 'Failed to delete loan type');
            }),
            catchError(err => throwError(() => new Error(err.error?.message || 'Failed to delete loan type')))
        );
    }

    // Get Loan Types by Society
    getLoanTypesBySociety(societyId: string): Observable<LoanTypeDto[]> {
        const headers = this.getHeaders();
        const url = `${this.baseUrl}/society/${societyId}`;
        return this.http.get<ApiResponse<LoanTypeDto[]>>(url, { headers }).pipe(
            map(res => {
                if (res.success && res.data) return res.data;
                throw new Error(res.message || 'No loan types found');
            }),
            catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch loan types')))
        );
    }
}
