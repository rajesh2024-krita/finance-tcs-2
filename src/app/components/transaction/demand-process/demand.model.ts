/**
 * Interface representing a row in the table for a processed demand.
 * Extend with additional fields returned from your backend as required.
 */
export interface DemandResult {
  memberId?: number;
  memberName: string;
  contribution: number; // contribution / share
  loanDue: number;      // loan amount due
  interest: number;     // loan interest
  penalInterest: number;// penal interest
  arrear: number;       // arrears (if any)
  total: number;        // total demand for the member
}