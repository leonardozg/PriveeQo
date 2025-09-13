# PRIVEE - Quote Management System

## Overview
PRIVEE is a modern web application designed for managing project quotes and proposals. It facilitates quote creation, management, and viewing through role-based interfaces for administrators, partners, and clients. Key capabilities include a comprehensive quote builder with item management, margin calculations, and PDF generation. The business vision is to provide a robust, user-friendly system that streamlines the quoting process for event management, offering significant market potential for businesses needing efficient proposal generation. 

**DEPLOYMENT STATUS**: System is 99% ready for Replit production deployment. All critical issues resolved including port configuration, production encoding fixes, HTML generation, and build process optimization. Only pending action: manual .replit file update by user.

## User Preferences
Preferred communication style: Simple, everyday language.
Language preference: Application fully translated to Spanish.
Design preferences: Clean gray color scheme with Arial font for maximum readability across all devices.
Branding: PRIVEE logo (`Hires jpeg-05_1754761049044.jpg`) with professional gray color palette throughout partner portal.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite build tool)
- **Styling**: Tailwind CSS with shadcn/ui for consistent design
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (client-side, role-based navigation)
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF for client-side PDF creation

### Backend
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API
- **Data Storage**: In-memory storage (interface for future database integration)
- **Schema Validation**: Zod schemas shared with frontend
- **Development Setup**: Vite middleware integration

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Users, Sessions, Items, Quotes, Quote Items, Partners tables
- **Validation**: Drizzle-Zod for type-safe schema validation
- **Authentication**: PostgreSQL session store for Replit Auth (partner portal), custom admin auth

### Independent Authentication Systems
- **Admin Portal**: Custom authentication (admin/admin123), dedicated `/api/admin/*` routes, full CRUD for items, quotes, partners, password management.
- **Partner Portal**: Admin-managed credentials, dedicated `/api/partner/*` routes (login, logout, me, change-password), protected quote creation, self-service password changes.
- **Quote Sharing**: Direct URL access via `/quote/[CODE]` for client viewing.
- **Separation**: Portals operate independently without cross-referencing.

### Password Management
- **Admin Users**: Can change password via dialog, requires current password verification. Default admin credentials (admin/Admin2025!) auto-configured. Admins manage partner passwords.
- **Partner Users**: Can change passwords via partner portal. All partner credentials are scrypt-hashed.

### Quote Generation System
- Partners create quotes via `/api/partner/quotes`.
- Quote and `quote_items` tables linked with foreign keys.
- Integer margin validation implemented.
- Automatic quote number generation (AM-J-XXXX format).
- Item selection from 87-item catalog with dynamic margin adjustments (base price + margin).
- Quote preview system.
- Event-focused UI and optional event date support.
- Direct HTML routes (`/quote/QUOTE-CODE`) for client viewing, with 30-day expiration.
- Unique quote codes (QF-YYYY-XXXXXX format).

### Production Database Auto-Setup
- Server automatically detects empty database and loads a complete catalog of 87 products across categories (Menú, Mobiliario, Decoración, Audio y Video).
- Quality Tiers: Plata (15-25% margins), Oro (15-30% margins), Platino (15-35% margins).
- Event Types: Club, Ceremonia, Gala ambientations.
- Default administrator (admin/Admin2025!) created automatically.
- Environment detection using `REPLIT_DEPLOYMENT`.
- Production-ready with zero manual configuration.

### Component Architecture
- **UI Components**: Modular shadcn/ui components with consistent theming.
- **Form Components**: Reusable form elements with built-in validation.
- **Modal System**: Dialog-based interfaces for quote creation and PDF preview.
- **Responsive Design**: Mobile-first approach.

### Data Management
- Bulk import policy restricted to products only for security.
- Users and partners are manually created via the admin panel.
- Latest CSV `data_1754941995278.csv` with 87 unique products, Spanish orthography, and UTF-8 support.
- Robust CSV parser with multiline field support and BOM handling.
- Admin can edit products; changes persist in memory.
- Database reset function only removes products/quotes, preserving user accounts.

### Debugging and Diagnostics
- Enhanced error handling (500 errors without crashes).
- Comprehensive logging.
- Health check endpoint (`/api/health`).
- Robust session management.

## External Dependencies

### UI and Styling
- **shadcn/ui**: Component library built on Radix UI.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible, unstyled UI primitives.
- **Lucide React**: Icon library.

### Data Management
- **TanStack Query**: Server state management.
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation and schema definition.

### Database and Storage
- **Drizzle ORM**: Type-safe ORM with PostgreSQL support.
- **Neon Database**: Serverless PostgreSQL (configured).
- **Connect PG Simple**: PostgreSQL session store.

### Development Tools
- **Vite**: Fast build tool.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.

### Utilities
- **date-fns**: Date manipulation and formatting.
- **class-variance-authority**: Type-safe CSS class variants.
- **clsx**: Conditional className utility.