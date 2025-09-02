// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  societyId?: number;
  societyName?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  lastLogin?: Date;
  token?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
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

  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.post<any>(this.apiUrl, loginData, { headers }).pipe(
    map(response => {
      console.log('Login API raw response:', response);

      const success = response?.success ?? false;
      const data = response?.data;

      if (success && data) {
        // If data.user does not exist, treat data itself as user object
        const user = data.user || {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        };

        if (!user) throw new Error('User data missing in response');

        user.token = data.token;
        user.lastLogin = new Date();

        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);

        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authToken', data.token);

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
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
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
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          this.clearStorage();
        }
      }
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
  }
}