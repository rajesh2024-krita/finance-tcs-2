import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DemandResult } from './demand.model';

@Injectable({ providedIn: 'root' })
export class DemandService {
  private mockDemands: DemandResult[] = [
    {
      memberName: 'John Doe',
      contribution: 500,
      loanDue: 200,
      interest: 50,
      penalInterest: 10,
      arrear: 0,
      total: 760
    },
    {
      memberName: 'Jane Smith',
      contribution: 600,
      loanDue: 100,
      interest: 40,
      penalInterest: 5,
      arrear: 20,
      total: 765
    }
  ];

  constructor() {}

  /** Simulate demand processing */
  processDemand(payload: { month: number; year: number; recoveryDate?: string | null }): Observable<{ success: boolean; message: string }> {
    console.log('Simulating demand process with payload:', payload);

    return of({
      success: true,
      message: `Demand processed for ${payload.month}/${payload.year}`
    }).pipe(delay(1000)); // simulate API delay
  }

  /** Simulate fetching latest demands */
  getLatestDemands(): Observable<DemandResult[]> {
    return of(this.mockDemands).pipe(delay(500));
  }
}
