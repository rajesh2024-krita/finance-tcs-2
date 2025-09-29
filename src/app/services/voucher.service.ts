// src/app/services/voucher.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// ------------ DTO Interfaces ------------
export interface VoucherRequest {
    particularId: number;
    societyId: number;
    voucherType: string;
    voucherDate: string;
    narration: string;
    memberId: number;
    loanId?: number;
    amount: number;
    bankId: number;
    chequeNumber: string;
    chequeDate: string;
}

export interface LedgerAccount {
    ledgerAccountId: number;
    accountName: string;
    accountCode: string;
    memberId: number;
    memberName: string
}

export interface BankAccount {
    id: number;
    bankId: number;
    bankName: string;
    accountNumber: string;
    loanTypeId: number;
}

export interface Member {
    id: number;
    name: string;
    memberCode: string;
}

export interface Loan {
    loanId: number;
    loanAccountNo: string;
    memberId: number;
}

export interface Particular {
    particularId: number;
    name: string;
    code: string;
}

@Injectable({
    providedIn: 'root'
})
export class VoucherService {
    private baseUrl = 'https://fintcssociety.onrender.com/api/Voucher';
    private ledgerAllUrl = 'https://fintcssociety.onrender.com/api/Ledger/all';
    private bankAccountUrl = 'https://fintcssociety.onrender.com/api/BankAccount';
    private memberLoanUrl = 'https://fintcssociety.onrender.com/api/Loan/member';
    private memberUrl = 'https://fintcssociety.onrender.com/api/member';

    constructor(private http: HttpClient, private authService: AuthService) { }

    // ---------- Headers with Auth ----------
    private getHeaders(): HttpHeaders {
        const token = this.authService.getAuthToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // ---------- Voucher ----------
    createVoucher(voucherData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/create`, voucherData, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    // ---------- Ledger ----------
    getLedgers(): Observable<LedgerAccount[]> {
        return this.http.get<LedgerAccount[]>(this.ledgerAllUrl, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    // ---------- Bank ----------
    getBanks(): Observable<BankAccount[]> {
        const params = new HttpParams().set('societyId', '1');
        return this.http.get<BankAccount[]>(this.bankAccountUrl, { headers: this.getHeaders(), params })
            .pipe(catchError(this.handleError));
    }

    // ---------- Members ----------
    getMembers(): Observable<Member[]> {
        const params = new HttpParams().set('societyId', '1');
        return this.http.get<Member[]>(this.memberUrl, { headers: this.getHeaders(), params })
            .pipe(catchError(this.handleError));
    }

    // ---------- Member Loans ----------
    getMemberLoans(memberId: number): Observable<Loan[]> {
        const params = new HttpParams().set('memberId', memberId.toString());
        return this.http.get<Loan[]>(this.memberLoanUrl, { headers: this.getHeaders(), params })
            .pipe(catchError(this.handleError));
    }

    // ---------- Error Handling ----------
    private handleError(error: HttpErrorResponse) {
        let errorMsg = 'Unknown error!';
        if (error.error instanceof ErrorEvent) {
            errorMsg = `Client error: ${error.error.message}`;
        } else {
            errorMsg = `Server error ${error.status}: ${error.message}`;
        }
        return throwError(() => new Error(errorMsg));
    }
}