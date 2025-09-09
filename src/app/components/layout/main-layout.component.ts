import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, Event } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatDividerModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <mat-sidenav-container class="flex-1 h-full">
        <mat-sidenav 
          #drawer
          [mode]="isMobile ? 'over' : 'side'" 
          [opened]="!isMobile"
          class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        >
          <!-- Brand -->
          <div class="flex items-start gap-2 px-6 py-5 border-b border-blue-500 dark:border-gray-700">
            <mat-icon class="text-white text-2xl">account_balance</mat-icon>
            <h2 class="font-bold text-white">FinTCS</h2>
          </div>

          <!-- Navigation -->
          <nav class="mt-4">
            <ng-container *ngFor="let section of menuSections">
              <div class="">
                <div class="px-6 py-2 text-xs font-normal text-slate-200 uppercase mt-4">
                  {{section.label}}
                </div>
                <ng-container *ngFor="let item of section.children" class="s">
                  <a 
                  [routerLink]="item.route"
                  routerLinkActive="bg-white text-black"
                  class="flex items-center gap-3 mx-3  py-3 text-slate-200 hover:text-black hover:bg-white rounded-md transition-all duration-200"
                  (click)="closeMobileNav()"
                  >
                    <div routerLinkActive="h-4 border-l-4 border-black block mr-6" class="hover:text-black hover:h-4 hover:border-l-4 hover:border-black hover:block hover:mr-6"></div>
                    <mat-icon routerLinkActive="bg-white text-black " class="">{{item.icon}}</mat-icon>
                    <span routerLinkActive="bg-white text-black ">{{item.label}}</span>
                  </a>
                </ng-container>
              </div>
            </ng-container>
          </nav>
        </mat-sidenav>

        <!-- Main -->
        <mat-sidenav-content class="flex flex-col h-full">
          <!-- Topbar -->
          <mat-toolbar class="px-4 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center">
            <div class="flex items-center gap-2">
              <button mat-icon-button (click)="drawer.toggle()" class="lg:hidden">
                <mat-icon>menu</mat-icon>
              </button>
            </div>

            <div class="flex items-center gap-4">

              <!-- User Menu -->
              <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="User Menu">
                <mat-icon>account_circle</mat-icon>
              </button>
            </div>
          </mat-toolbar>

          <!-- Page Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-full font-semibold">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <div class="font-semibold">{{ currentUser?.name || 'User' }}</div>
            <div class="text-sm text-gray-500">{{ currentUser?.email || 'user@example.com' }}</div>
          </div>
        </div>
      </div>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  `,
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  isMobile = false;
  currentUser: any = null;

  menuSections: MenuItem[] = [
    {
      label: 'General',
      icon: '',
      children: [
        { label: 'Overview', icon: 'dashboard', route: '/dashboard' },
      ]
    },
    {
      label: 'File Management',
      icon: '',
      children: [
        { label: 'Society', icon: 'business', route: '/file/society' },
      ]
    },
    {
      label: 'Master Data',
      icon: '',
      children: [
        { label: 'Member Details', icon: 'people', route: '/master/member-details' },
      ]
    },
    {
      label: 'Transactions',
      icon: '',
      children: [
        { label: 'Loan Taken', icon: 'account_balance_wallet', route: '/transaction/loan-taken' },
      ]
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile = result.matches);

    this.currentUser = this.authService.getCurrentUser();
  }

  closeMobileNav() {
    if (this.isMobile) {
      this.drawer.close();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
