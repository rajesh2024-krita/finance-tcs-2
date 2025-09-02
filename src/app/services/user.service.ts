import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRole } from './auth.service';

export interface UserDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  societyId?: number;
  societyName?: string;
  createdAt: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  societyId?: number;
}

// UserRole enum is imported from auth.service.ts

export interface SocietyDropdownDto {
  id: number;
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
  cash: number;
  bonus: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl || 'http://localhost:3000'}/api/user`;

  constructor(private http: HttpClient) {}

  // Create new user
  createUser(createUserDto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.baseUrl, createUserDto);
  }

  // Get all users (filtered by society for Society Admin)
  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.baseUrl);
  }

  // Get user by ID
  getUser(userId: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${userId}`);
  }

  // Get societies for dropdown (Super Admin only)
  getSocietiesForDropdown(): Observable<SocietyDropdownDto[]> {
    return this.http.get<SocietyDropdownDto[]>(`${this.baseUrl}/societies`);
  }

  // Update user (if needed later)
  updateUser(userId: number, updateData: Partial<CreateUserDto>): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/${userId}`, updateData);
  }

  // Delete user (if needed later)
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}