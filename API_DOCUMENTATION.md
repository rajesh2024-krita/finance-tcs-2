# Society Management System API Documentation

## Overview

The Society Management System is a comprehensive backend API that manages hierarchical organizational structures with role-based access control and approval workflows. The system supports multiple societies with a sophisticated approval system where Society Admin changes require unanimous approval from all Users within their society.

## Base URL
```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) authentication with Bearer token format.

### Headers Required for Protected Endpoints
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## User Roles & Permissions

### Role Hierarchy
1. **Super Admin** (Role: 1)
   - Full access to all societies
   - Can create societies and society admins
   - Changes apply immediately (no approval needed)

2. **Society Admin** (Role: 2)
   - Manages single society
   - Can create users and members within their society
   - Society edits require approval from all Users
   
3. **User** (Role: 3)
   - Belongs to a society
   - Can create members within their society
   - Must approve/reject society changes made by Society Admin
   
4. **Member** (Role: 4)
   - Basic profile data
   - No special access permissions

## API Endpoints

### 🔐 Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@societymanagement.com",
    "phone": "",
    "role": 1,
    "societyId": null,
    "societyName": null,
    "createdAt": "2025-08-25T17:22:00.009678Z"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "message": "Invalid username or password"
}
```

#### GET /auth/profile
**Description**: Get current user profile  
**Authorization**: Required  

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@societymanagement.com",
  "phone": "",
  "role": 1,
  "societyId": null,
  "societyName": null,
  "createdAt": "2025-08-25T17:22:00.009678Z"
}
```

### 🏢 Society Management Endpoints

#### POST /society
**Description**: Create new society (Super Admin only)  
**Authorization**: Super Admin required  

**Request Body**:
```json
{
  "societyName": "Tech Workers Society",
  "registrationNumber": "TWS001",
  "address": "123 Tech Street",
  "city": "Tech City",
  "phone": "123-456-7890",
  "fax": "123-456-7891",
  "email": "info@techworkers.com",
  "website": "https://techworkers.com",
  "dividend": 5.5,
  "overdraft": 10000.00,
  "currentDeposit": 50000.00,
  "loan": 100000.00,
  "emergencyLoan": 25000.00,
  "las": 15000.00,
  "shareLimit": 5000.00,
  "loanLimit": 200000.00,
  "emergencyLoanLimit": 50000.00,
  "chequeBounceCharge": 500.00,
  "chequeReturnCharge": 250.00,
  "cash": 75000.00,
  "bonus": 1000.00,
  "adminUsername": "societyadmin1",
  "adminPassword": "admin123",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminEmail": "john@techworkers.com",
  "adminPhone": "123-456-7892"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "societyName": "Tech Workers Society",
  "registrationNumber": "TWS001",
  "address": "123 Tech Street",
  "city": "Tech City",
  "phone": "123-456-7890",
  "fax": "123-456-7891",
  "email": "info@techworkers.com",
  "website": "https://techworkers.com",
  "dividend": 5.5,
  "overdraft": 10000.00,
  "currentDeposit": 50000.00,
  "loan": 100000.00,
  "emergencyLoan": 25000.00,
  "las": 15000.00,
  "shareLimit": 5000.00,
  "loanLimit": 200000.00,
  "emergencyLoanLimit": 50000.00,
  "chequeBounceCharge": 500.00,
  "chequeReturnCharge": 250.00,
  "cash": 75000.00,
  "bonus": 1000.00,
  "createdAt": "2025-08-25T17:22:00.009678Z",
  "updatedAt": "2025-08-25T17:22:00.009678Z",
  "hasPendingEdits": false
}
```

#### GET /society
**Description**: Get all societies (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "societyName": "Tech Workers Society",
    "registrationNumber": "TWS001",
    "address": "123 Tech Street",
    "city": "Tech City",
    "phone": "123-456-7890",
    "fax": "123-456-7891",
    "email": "info@techworkers.com",
    "website": "https://techworkers.com",
    "dividend": 5.5,
    "overdraft": 10000.00,
    "currentDeposit": 50000.00,
    "loan": 100000.00,
    "emergencyLoan": 25000.00,
    "las": 15000.00,
    "shareLimit": 5000.00,
    "loanLimit": 200000.00,
    "emergencyLoanLimit": 50000.00,
    "chequeBounceCharge": 500.00,
    "chequeReturnCharge": 250.00,
    "cash": 75000.00,
    "bonus": 1000.00,
    "createdAt": "2025-08-25T17:22:00.009678Z",
    "updatedAt": "2025-08-25T17:22:00.009678Z",
    "hasPendingEdits": false
  }
]
```

#### GET /society/{id}
**Description**: Get society by ID (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

**Response** (200 OK): Same as individual society object above

#### PUT /society/{id}
**Description**: Update society (Super Admin: immediate, Society Admin: pending approval)  
**Authorization**: Super Admin or Society Admin required  

**Request Body**:
```json
{
  "societyName": "Updated Tech Workers Society",
  "registrationNumber": "TWS001-UPD",
  "address": "456 New Tech Avenue",
  "city": "New Tech City",
  "phone": "987-654-3210",
  "fax": "987-654-3211",
  "email": "newemail@techworkers.com",
  "website": "https://newtechworkers.com",
  "dividend": 6.0,
  "overdraft": 12000.00,
  "currentDeposit": 60000.00,
  "loan": 120000.00,
  "emergencyLoan": 30000.00,
  "las": 18000.00,
  "shareLimit": 6000.00,
  "loanLimit": 250000.00,
  "emergencyLoanLimit": 60000.00,
  "chequeBounceCharge": 600.00,
  "chequeReturnCharge": 300.00,
  "cash": 85000.00,
  "bonus": 1200.00
}
```

**Response** (200 OK):
- **Super Admin**: `{"message": "Society updated successfully"}`
- **Society Admin**: `{"message": "Society update submitted for approval"}`

### 📋 Approval Workflow Endpoints

#### GET /society/pending-edits
**Description**: Get pending society edits for approval  
**Authorization**: Super Admin or User required  

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "societyId": 1,
    "societyName": "Tech Workers Society",
    "editedByUserName": "Jane Smith",
    "createdAt": "2025-08-25T17:22:00.009678Z",
    "isApproved": false,
    "approvals": [
      {
        "userId": 3,
        "userName": "Bob Johnson",
        "isApproved": true,
        "comments": "Looks good",
        "approvedAt": "2025-08-25T17:25:00.009678Z"
      }
    ],
    "pendingChanges": {
      "societyName": "Updated Tech Workers Society",
      "registrationNumber": "TWS001-UPD",
      "address": "456 New Tech Avenue",
      "city": "New Tech City",
      "phone": "987-654-3210",
      "fax": "987-654-3211",
      "email": "newemail@techworkers.com",
      "website": "https://newtechworkers.com",
      "dividend": 6.0,
      "overdraft": 12000.00,
      "currentDeposit": 60000.00,
      "loan": 120000.00,
      "emergencyLoan": 30000.00,
      "las": 18000.00,
      "shareLimit": 6000.00,
      "loanLimit": 250000.00,
      "emergencyLoanLimit": 60000.00,
      "chequeBounceCharge": 600.00,
      "chequeReturnCharge": 300.00,
      "cash": 85000.00,
      "bonus": 1200.00
    }
  }
]
```

#### POST /society/approve-edit/{id}
**Description**: Approve or reject pending society edit  
**Authorization**: User role required  

**Request Body**:
```json
{
  "isApproved": true,
  "comments": "Changes look good, approved!"
}
```

**Response** (200 OK):
```json
{
  "message": "Approval submitted successfully"
}
```

### 👥 User Management Endpoints

#### POST /user
**Description**: Create new user (Super Admin or Society Admin)  
**Authorization**: Super Admin or Society Admin required  

**Request Body**:
```json
{
  "username": "newuser1",
  "password": "user123",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@techworkers.com",
  "phone": "555-123-4567",
  "role": 3
}
```

**Response** (201 Created):
```json
{
  "id": 4,
  "username": "newuser1",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@techworkers.com",
  "phone": "555-123-4567",
  "role": 3,
  "societyId": 1,
  "societyName": "Tech Workers Society",
  "createdAt": "2025-08-25T17:22:00.009678Z"
}
```

#### GET /user
**Description**: Get all users (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

#### GET /user/{id}
**Description**: Get user by ID (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

#### PUT /user/{id}
**Description**: Update user  
**Authorization**: Super Admin, Society Admin, or User (own profile) required  

### 👤 Member Management Endpoints

#### POST /member
**Description**: Create new member  
**Authorization**: Super Admin, Society Admin, or User required  

**Request Body**:
```json
{
  "name": "John Smith",
  "memberNumber": "MEM001",
  "email": "john.smith@email.com",
  "phone": "555-987-6543",
  "address": "789 Member Street",
  "dateOfJoining": "2025-08-25T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "John Smith",
  "memberNumber": "MEM001",
  "email": "john.smith@email.com",
  "phone": "555-987-6543",
  "address": "789 Member Street",
  "dateOfJoining": "2025-08-25T00:00:00Z",
  "societyId": 1,
  "createdByUserId": 2,
  "createdAt": "2025-08-25T17:22:00.009678Z"
}
```

#### GET /member
**Description**: Get all members (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

#### GET /member/{id}
**Description**: Get member by ID (access based on user role)  
**Authorization**: Super Admin, Society Admin, or User required  

#### PUT /member/{id}
**Description**: Update member  
**Authorization**: Super Admin, Society Admin, or User required  

## Error Responses

### Common Error Codes

**400 Bad Request**:
```json
{
  "message": "Error creating society",
  "error": "Society name already exists"
}
```

**401 Unauthorized**:
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "message": "You can only edit your own society"
}
```

**404 Not Found**:
```json
{
  "message": "Society not found"
}
```

## Approval Workflow Logic

### Society Edit Approval Process

1. **Society Admin** submits edit request → Creates `SocietyEditPending` record
2. **All Users** in the society must approve the changes
3. When **ALL Users** approve → Changes automatically apply to the Society
4. **Super Admin** edits apply immediately (bypass approval)

### Key Business Rules

- Super Admin has full access across all societies
- Society Admin can only manage their assigned society
- Users can only access data from their society
- Members have no administrative access
- All Society Admin changes require unanimous User approval
- No delete operations are implemented (Create, Read, Update only)

## Database Schema

### Core Tables
- **Users**: Stores all system users with role-based access
- **Societies**: Main society information and financial data
- **Members**: Individual member profiles linked to users
- **SocietyEditsPending**: Temporary storage for pending society changes
- **SocietyEditApprovals**: Tracks individual user approvals for pending changes

### Key Relationships
- User belongs to Society (nullable for Super Admin)
- Member belongs to User and Society
- SocietyEditPending belongs to Society and EditedByUser
- SocietyEditApproval belongs to PendingEdit and User

## Getting Started

### Default Super Admin Credentials
```
Username: admin
Password: admin
```

### Example API Usage Flow

1. **Login as Super Admin**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

2. **Create a Society** (use token from login):
   ```bash
   curl -X POST http://localhost:3000/api/society \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"societyName":"Test Society","adminUsername":"testadmin","adminPassword":"test123","adminFirstName":"Test","adminLastName":"Admin","adminEmail":"test@example.com"}'
   ```

3. **Login as Society Admin** and perform operations within your society scope.

## Security Features

- JWT-based stateless authentication
- Role-based authorization middleware
- Password hashing using BCrypt
- SQL injection protection via Entity Framework
- CORS configuration for cross-origin requests
- Unique constraints on usernames and society names

## Development Notes

- Built with ASP.NET Core 8.0
- PostgreSQL database with Entity Framework Core
- Decimal precision configured for financial fields (18,2)
- Comprehensive audit trail with CreatedAt/UpdatedAt timestamps
- Automatic database schema creation and seeding