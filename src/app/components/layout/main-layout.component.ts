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
    <div class="layout-container">
      <mat-sidenav-container class="sidenav-container">
        <!-- Professional Sidebar -->
        <mat-sidenav #drawer
                     [mode]="isMobile ? 'over' : 'side'"
                     [opened]="!isMobile"
                     class="sidebar-professional">
          
          <!-- Sidebar Header -->
          <div class="sidebar-header">
            <div class="flex items-center space-x-3 p-4">
              <div class="">
                <mat-icon class="text-white text-xl h-10 w-10">account_balance</mat-icon>
              </div>
              <div class="">
                <h2 class="text-white font-bold text-lg pt-3">FinTCS</h2>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="sidebar-nav">
            <!-- Render menu sections -->
            <ng-container *ngFor="let section of menuSections">
              <div class="nav-section">
                <div class="nav-section-header">{{section.label}}</div>
                
                <!-- Render menu items -->
                <ng-container *ngFor="let item of section.children">
                  <!-- For items with children (submenus) -->
                  <div *ngIf="item.children" class="nav-group">
                    <div class="nav-group-header">{{item.label}}</div>
                    <a *ngFor="let child of item.children" 
                       [routerLink]="child.route" 
                       routerLinkActive="active" 
                       class="nav-item nav-item-sub"
                       (click)="closeMobileNav()">
                      <mat-icon>{{child.icon}}</mat-icon>
                      <span>{{child.label}}</span>
                    </a>
                  </div>
                  
                  <!-- For regular items without children -->
                  <a *ngIf="!item.children" 
                     [routerLink]="item.route" 
                     routerLinkActive="active" 
                     class="nav-item"
                     (click)="closeMobileNav()">
                    <mat-icon>{{item.icon}}</mat-icon>
                    <span>{{item.label}}</span>
                  </a>
                </ng-container>
              </div>
            </ng-container>
          </nav>
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="main-content">
          <!-- Professional Header -->
          <mat-toolbar class="header-professional flex justify-between">
            <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
              <mat-icon>menu</mat-icon>
            </button>

            <!-- Header Actions -->
            <div class="flex items-center space-x-2">
              <!-- Dark Mode Toggle -->
              <button mat-icon-button 
                      (click)="toggleDarkMode()" 
                      matTooltip="Toggle Dark Mode"
                      class="header-action">
                <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>

              <!-- User Menu -->
              <button mat-icon-button 
                      [matMenuTriggerFor]="userMenu"
                      matTooltip="User Menu"
                      class="header-action">
                <mat-icon>account_circle</mat-icon>
              </button>
            </div>
          </mat-toolbar>

          <!-- Page Content -->
          <div class="content-professional">
            <div class="content-wrapper">
              <router-outlet></router-outlet>
            </div>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      <div class="menu-header">
        <div class="flex items-center space-x-3 p-2">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <div class="text-body font-semibold">{{ currentUser?.name || 'User' }}</div>
            <div class="text-caption text-gray-500">{{ currentUser?.email || 'user@example.com' }}</div>
          </div>
        </div>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>My Profile</span>
      </button>
      <button mat-menu-item routerLink="/settings">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
      background: var(--color-bg-secondary);
    }

    .sidebar-professional {
      width: 280px;
      border-right: 1px solid var(--color-border);
      background: var(--gradient-sidebar);
    }

    .sidebar-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: var(--spacing-md);
    }

    .sidebar-nav {
      padding: var(--spacing-md);
    }

    .nav-section {
      margin-bottom: var(--spacing-lg);
    }

    .nav-section-header {
      padding: var(--spacing-sm) var(--spacing-md);
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--spacing-sm);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 12px var(--spacing-md);
      margin: 2px 0;
      border-radius: var(--radius-md);
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      font-weight: 500;
      font-size: 14px;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateX(4px);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      font-weight: 600;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: white;
      border-radius: 0 2px 2px 0;
    }

    .nav-group {
      margin-left: var(--spacing-md);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      padding-left: var(--spacing-md);
      margin-top: var(--spacing-sm);
    }

    .nav-group-header {
      padding: var(--spacing-xs) var(--spacing-sm);
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--spacing-xs);
    }

    .nav-item-sub {
      font-size: 13px;
      padding: 8px var(--spacing-sm);
      margin: 1px 0;
    }

    .header-professional {
      background: var(--color-bg-card);
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border);
      height: 64px;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .menu-button {
      margin-right: var(--spacing-md);
    }

    .header-action {
      width: 40px;
      height: 40px;
      transition: all 0.2s ease;
    }

    .header-action:hover {
      background: var(--color-bg-secondary);
      transform: scale(1.05);
    }

    .content-professional {
      background: var(--color-bg-secondary);
      min-height: calc(100vh - 64px);
      padding: var(--spacing-lg);
    }

    .content-wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }

    .menu-header {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: between;
      background: var(--color-bg-secondary);
    }

    .user-menu {
      min-width: 280px;
      max-width: 320px;
    }

    .user-menu .mat-mdc-menu-item {
      height: auto;
      min-height: 48px;
      padding: var(--spacing-sm) var(--spacing-md);
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .sidebar-professional {
        width: 100vw;
        max-width: 280px;
      }

      .content-professional {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 640px) {
      .content-professional {
        padding: var(--spacing-sm);
      }
    }
  `]
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