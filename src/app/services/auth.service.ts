// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  createdBy?: number;
  createdDate?: Date;
  lastLogin?: Date;
  token?: string;
  expiresAt?: Date; // added from API response
}

export enum UserRole {
  SUPER_ADMIN = 'Admin',
  SOCIETY_ADMIN = 'society_admin',
  BRANCH_ADMIN = 'branch_admin',
  ACCOUNTANT = 'accountant',
  OPERATOR = 'operator',
  MEMBER = 'member'
}

export interface Permission {
  module: string;
  actions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    expires?: string;
    user: User;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = 'https://1d4tg1qv-5000.inc1.devtunnels.ms/api/Auth/login';
  // private apiUrl = 'https://fintcsapi-1.onrender.com/api/Auth/login';

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private rolePermissions: Map<UserRole, Permission[]> = new Map([
    [UserRole.SUPER_ADMIN, [
      { module: 'all', actions: ['create', 'read', 'update', 'delete', 'approve'] }
    ]],
    [UserRole.SOCIETY_ADMIN, [
      { module: 'members', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'accounts', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'transactions', actions: ['create', 'read', 'update', 'approve'] },
      { module: 'reports', actions: ['read'] },
      { module: 'master', actions: ['create', 'read', 'update'] },
      { module: 'accountants', actions: ['create', 'read', 'update', 'delete'] }
    ]],
    [UserRole.ACCOUNTANT, [
      { module: 'accounts', actions: ['create', 'read', 'update'] },
      { module: 'transactions', actions: ['create', 'read', 'update'] },
      { module: 'reports', actions: ['read'] },
      { module: 'members', actions: ['read'] }
    ]],
    [UserRole.MEMBER, [
      { module: 'own-account', actions: ['read'] },
      { module: 'own-transactions', actions: ['read'] }
    ]]
  ]);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<boolean> {
    const loginData: LoginRequest = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<LoginResponse>(this.apiUrl, loginData, { headers }).pipe(
      map(response => {
        console.log('Login API raw response:', response);

        const success = response?.success ?? false;
        const data = response?.data;

        if (success && data) {
          let user = data.user || {} as User;

          // attach token & expiry
          user.token = data.token;
          user.expiresAt = data.expires ? new Date(data.expires) : undefined;
          user.lastLogin = new Date();

          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);

          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('tokenExpiry', data.expires ?? '');

          return true;
        } else {
          throw new Error(response?.message || 'Login failed');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error?.error?.message || 'Login failed'));
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return new Date(expiry) < new Date();
  }

  hasPermission(module: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = this.rolePermissions.get(user.role);
    if (!permissions) return false;

    if (user.role === UserRole.SUPER_ADMIN) return true;

    return permissions.some(permission =>
      (permission.module === module || permission.module === 'all') &&
      permission.actions.includes(action)
    );
  }

  canAccessRoute(route: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;

    const routePermissions: { [key: string]: { module: string, action: string } } = {
      '/master/member-details': { module: 'members', action: 'read' },
      '/transaction/deposit-receipt': { module: 'transactions', action: 'read' },
      '/accounts/cash-book': { module: 'accounts', action: 'read' },
      '/file/security/authority': { module: 'all', action: 'read' },
      '/file/security/new-user': { module: 'all', action: 'create' },
    };

    const permission = routePermissions[route];
    if (!permission) return true;

    return this.hasPermission(permission.module, permission.action);
  }

  getUserRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  canCreateRole(targetRole: UserRole): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return true;
      case UserRole.SOCIETY_ADMIN:
        return [UserRole.ACCOUNTANT, UserRole.MEMBER].includes(targetRole);
      default:
        return false;
    }
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (this.isTokenExpired()) {
          this.logout();
          return;
        }
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  }
}
