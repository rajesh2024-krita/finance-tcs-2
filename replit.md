# Society Management System

## Overview

This is a Society Management System built with ASP.NET Core that manages hierarchical organizational structures. The system supports multiple societies with role-based access control, allowing Super Admins to oversee all societies while Society Admins manage their specific organizations. The system features a sophisticated approval workflow where Society Admin changes require unanimous approval from all Users within their society before becoming active.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: ASP.NET Core Web API
- **Authentication**: JWT (JSON Web Tokens) with custom claims for role-based authorization
- **Database**: SQL Server with Entity Framework Core (Code-First approach)
- **Architecture Pattern**: Repository pattern with service layer separation

### Role-Based Hierarchy
The system implements a four-tier hierarchical structure:
1. **Super Admin**: Top-level access across all societies
2. **Society Admin**: Manages a single society with approval workflow constraints
3. **User**: Society-specific access with approval responsibilities
4. **Member**: Basic profile data tied to a specific User

### Approval Workflow System
- **Immediate Changes**: Super Admin modifications apply instantly
- **Pending State**: Society Admin changes enter a pending approval state
- **Unanimous Approval**: All Users within the society must approve before changes become active
- **Change Tracking**: System maintains audit trail of pending modifications

### Data Access Control
- Role-based middleware enforces strict data boundaries
- Society-scoped data access prevents cross-society information leakage
- JWT claims-based authorization for granular permission control

### Database Design
- **Main Entities**: Society, User, Member with proper foreign key relationships
- **Approval System**: Separate tables for tracking pending changes and approval status
- **Audit Trail**: Change history and approval tracking tables

## External Dependencies

### Core Framework
- **ASP.NET Core**: Primary web framework
- **Entity Framework Core**: ORM for database operations
- **SQL Server**: Primary database engine with trusted connection authentication

### Authentication & Security
- **JWT Bearer Tokens**: Stateless authentication with 60-minute expiration
- **Custom JWT Configuration**: Issuer, audience, and secret key validation
- **Role-based Authorization**: Custom middleware for hierarchical access control

### Configuration Management
- **appsettings.json**: Connection strings, JWT settings, and logging configuration
- **Environment-specific**: Separate configuration support for different deployment environments

### Logging & Monitoring
- **Built-in ASP.NET Core Logging**: Configured for Information level with Warning level for Microsoft components
- **Structured Logging**: Ready for integration with external logging providers