// sidebar-menu.ts

export const SidebarMenu = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Overview', icon: 'dashboard', route: '/dashboard' }
    ]
  },
  {
    section: 'File Management',
    items: [
      { label: 'Society', icon: 'business', route: '/file/society' },
    //   {
    //     group: 'Security',
    //     items: [
    //       { label: 'New User', icon: 'person_add', route: '/file/security/new-user' },
    //       { label: 'Authority', icon: 'security', route: '/file/security/authority' },
    //       { label: 'My Rights', icon: 'verified_user', route: '/file/security/my-rights' },
    //       { label: 'Change Password', icon: 'lock', route: '/file/security/change-password' }
    //     ]
    //   },
    //   { label: 'Create New Year', icon: 'event', route: '/file/create-new-year' }
    ]
  },
  {
    section: 'Master Data',
    items: [
      { label: 'Member Details', icon: 'people', route: '/master/member-details' },
      { label: 'Deposit Scheme', icon: 'savings', route: '/master/deposit-scheme' },
      { label: 'Interest Master', icon: 'percent', route: '/master/interest-master' },
      { label: 'Table Master', icon: 'table_view', route: '/master/table' }
    ]
  },
  {
    section: 'Transactions',
    items: [
      { label: 'Deposit Receipt', icon: 'receipt', route: '/transaction/deposit-receipt' },
      { label: 'Deposit Payment', icon: 'payment', route: '/transaction/deposit-payment' },
      { label: 'Demand', icon: 'payment', route: '/transaction/monthly-demand' },
      { label: 'Loan Taken', icon: 'account_balance_wallet', route: '/transaction/loan-taken' },
      { label: 'Deposit Slip', icon: 'description', route: '/transaction/deposit-slip' }
    ]
  },
  {
    section: 'Accounts',
    items: [
      { label: 'Voucher', icon: 'note', route: '/accounts/voucher-creation' },
      { label: 'Loan Receipt', icon: 'note', route: '/accounts/loan-receipt' },
      { label: 'Cash Book', icon: 'book', route: '/accounts/cash-book' },
      { label: 'Ledger', icon: 'account_book', route: '/accounts/ledger' },
      { label: 'Trial Balance', icon: 'balance', route: '/accounts/trial-balance' },
      { label: 'Profit & Loss', icon: 'trending_up', route: '/accounts/profit-loss' },
      { label: 'Balance Sheet', icon: 'assessment', route: '/accounts/balance-sheet' }
    ]
  },
  {
    section: 'Reports',
    items: [
      { label: 'Employee Reports', icon: 'group', route: '/reports/employees' },
      { label: 'Loan Reports', icon: 'money', route: '/reports/loan' },
      { label: 'Opening Balance', icon: 'start', route: '/reports/opening-balance' },
      { label: 'Closing Balance', icon: 'stop', route: '/reports/closing-balance' }
    ]
  },
  {
    section: 'System',
    items: [
      { label: 'Backup', icon: 'backup', route: '/backup' },
      { label: 'Administration', icon: 'admin_panel_settings', route: '/admin' }
    ]
  }
];
