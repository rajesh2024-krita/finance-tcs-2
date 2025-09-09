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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: number;
  divider?: boolean;
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
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <mat-sidenav-container class="flex-1 h-full">
        <mat-sidenav 
          #drawer
          [mode]="isMobile ? 'over' : 'side'" 
          [opened]="!isMobile"
          class="w-64 bg-blue-500 text-white shadow-lg"
        >
          <!-- Sidebar Header -->
          <div class="flex items-start gap-3 px-4 py-5 border-b border-blue-600">
            <mat-icon class="text-white text-3xl">account_balance</mat-icon>
            <h2 class="text-lg font-bold text-white">FinTCS</h2>
          </div>

          <!-- Navigation -->
          <nav class="mt-4 space-y-4">
            <ng-container *ngFor="let section of menuSections">
              <div>
                <!-- Section Label -->
                <div class="px-4 text-xs font-semibold uppercase text-gray-300 mb-1">
                  {{section.label}}
                </div>

                <!-- Items -->
                <ng-container *ngFor="let item of section.children">
                  <!-- Parent with children -->
                  <div *ngIf="item.children" class="px-2">
                    <div class="text-sm font-semibold text-gray-200 mb-1">{{item.label}}</div>
                    <a *ngFor="let child of item.children"
                      [routerLink]="child.route"
                      routerLinkActive="bg-blue-800"
                      class="flex items-center gap-3 px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
                      (click)="closeMobileNav()">
                      <mat-icon class="text-gray-200 text-base">{{child.icon}}</mat-icon>
                      <span>{{child.label}}</span>
                    </a>
                  </div>

                  <!-- Simple item -->
                  <a *ngIf="!item.children"
                    [routerLink]="item.route"
                    routerLinkActive="bg-blue-800"
                    class="flex items-center gap-3 px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
                    (click)="closeMobileNav()">
                    <mat-icon class="text-gray-200 text-base">{{item.icon}}</mat-icon>
                    <span>{{item.label}}</span>
                  </a>
                </ng-container>
              </div>
            </ng-container>
          </nav>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="flex flex-col h-full">
          <!-- Header -->
          <mat-toolbar class="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800 shadow">
            <button mat-icon-button (click)="drawer.toggle()" class="lg:hidden">
              <mat-icon>menu</mat-icon>
            </button>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <!-- Dark Mode -->
              <!-- <button mat-icon-button (click)="toggleDarkMode()" matTooltip="Toggle Dark Mode">
                <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button> -->

              <!-- User -->
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
    <mat-menu #userMenu="matMenu" class="p-0">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <div class="font-semibold">{{ currentUser?.name || 'User' }}</div>
            <div class="text-sm text-gray-500">{{ currentUser?.email || 'user@example.com' }}</div>
          </div>
        </div>
      </div>
      <!-- <button mat-menu-item routerLink="/profile" class="hover:bg-gray-100 dark:hover:bg-gray-800">
        <mat-icon>person</mat-icon>
        <span>My Profile</span>
      </button>
      <button mat-menu-item routerLink="/settings" class="hover:bg-gray-100 dark:hover:bg-gray-800">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button> -->
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()" class="hover:bg-gray-100 dark:hover:bg-gray-800">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>

  `,
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  isMobile = false;
  isDarkMode = false;
  currentUser: any = null;
  breadcrumbs: { label: string; route?: string }[] = [];

  // Define menu structure as an array
  menuSections: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '',
      children: [
        {
          label: 'Overview',
          icon: 'dashboard',
          route: '/dashboard'
        }
      ]
    },
    {
      label: 'File Management',
      icon: '',
      children: [
        {
          label: 'Society',
          icon: 'business',
          route: '/file/society'
        },
        // {
        //   label: 'Security',
        //   icon: 'security',
        //   children: [
        //     {
        //       label: 'New User',
        //       icon: 'person_add',
        //       route: '/file/security/new-user'
        //     },
        //     {
        //       label: 'Authority',
        //       icon: 'security',
        //       route: '/file/security/authority'
        //     },
        //     {
        //       label: 'My Rights',
        //       icon: 'verified_user',
        //       route: '/file/security/my-rights'
        //     },
        //     {
        //       label: 'Change Password',
        //       icon: 'lock',
        //       route: '/file/security/change-password'
        //     }
        //   ]
        // },
        // {
        //   label: 'Create New Year',
        //   icon: 'event',
        //   route: '/file/create-new-year'
        // }
      ]
    },
    {
      label: 'Master Data',
      icon: '',
      children: [
        {
          label: 'Member Details',
          icon: 'people',
          route: '/master/member-details'
        },
        // {
        //   label: 'Deposit Scheme',
        //   icon: 'savings',
        //   route: '/master/deposit-scheme'
        // },
        // {
        //   label: 'Interest Master',
        //   icon: 'percent',
        //   route: '/master/interest-master'
        // },
        // {
        //   label: 'Table Master',
        //   icon: 'table_view',
        //   route: '/master/table'
        // }
      ]
    },
    {
      label: 'Transactions',
      icon: '',
      children: [
        // {
        //   label: 'Deposit Receipt',
        //   icon: 'receipt',
        //   route: '/transaction/deposit-receipt'
        // },
        // {
        //   label: 'Deposit Payment',
        //   icon: 'payment',
        //   route: '/transaction/deposit-payment'
        // },
        // {
        //   label: 'Demand',
        //   icon: 'payment',
        //   route: '/transaction/monthly-demand'
        // },
        {
          label: 'Loan Taken',
          icon: 'account_balance_wallet',
          route: '/transaction/loan-taken'
        },
        // {
        //   label: 'Deposit Slip',
        //   icon: 'description',
        //   route: '/transaction/deposit-slip'
        // }
      ]
    },
    // {
    //   label: 'Accounts',
    //   icon: '',
    //   children: [
    //     {
    //       label: 'Voucher',
    //       icon: 'note',
    //       route: '/accounts/voucher-creation'
    //     },
    //     {
    //       label: 'Loan Receipt',
    //       icon: 'note',
    //       route: '/accounts/loan-receipt'
    //     },
    //     {
    //       label: 'Cash Book',
    //       icon: 'book',
    //       route: '/accounts/cash-book'
    //     },
    //     {
    //       label: 'Ledger',
    //       icon: 'account_book',
    //       route: '/accounts/ledger'
    //     },
    //     {
    //       label: 'Trial Balance',
    //       icon: 'balance',
    //       route: '/accounts/trial-balance'
    //     },
    //     {
    //       label: 'Profit & Loss',
    //       icon: 'trending_up',
    //       route: '/accounts/profit-loss'
    //     },
    //     {
    //       label: 'Balance Sheet',
    //       icon: 'assessment',
    //       route: '/accounts/balance-sheet'
    //     }
    //   ]
    // },
    // {
    //   label: 'Reports',
    //   icon: '',
    //   children: [
    //     {
    //       label: 'Employee Reports',
    //       icon: 'group',
    //       route: '/reports/employees'
    //     },
    //     {
    //       label: 'Loan Reports',
    //       icon: 'money',
    //       route: '/reports/loan'
    //     },
    //     {
    //       label: 'Opening Balance',
    //       icon: 'start',
    //       route: '/reports/opening-balance'
    //     },
    //     {
    //       label: 'Closing Balance',
    //       icon: 'stop',
    //       route: '/reports/closing-balance'
    //     }
    //   ]
    // },
    // {
    //   label: 'System',
    //   icon: '',
    //   children: [
    //     {
    //       label: 'Backup',
    //       icon: 'backup',
    //       route: '/backup'
    //     },
    //     {
    //       label: 'Administration',
    //       icon: 'admin_panel_settings',
    //       route: '/admin'
    //     }
    //   ]
    // }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Check if mobile
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Load dark mode preference
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.updateDarkMode();

    // Get current user
    this.currentUser = this.authService.getCurrentUser();

    // Listen to route changes for breadcrumbs
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateBreadcrumbs(event.url);
      });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.updateDarkMode();
  }

  private updateDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private updateBreadcrumbs(url: string) {
    const segments = url.split('/').filter(segment => segment);
    this.breadcrumbs = [{ label: 'Dashboard', route: '/dashboard' }];

    let currentRoute = '';
    segments.forEach((segment, index) => {
      currentRoute += `/${segment}`;
      const label = this.formatBreadcrumbLabel(segment);
      this.breadcrumbs.push({ label, route: index === segments.length - 1 ? undefined : currentRoute });
    });
  }

  private formatBreadcrumbLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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