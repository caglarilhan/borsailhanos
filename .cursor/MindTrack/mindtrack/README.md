# MindTrack - Therapist Practice Management System

A comprehensive, professional practice management system designed specifically for therapists, psychologists, and mental health professionals.

## 🚀 Features

### Core Management
- **Client Management** - Comprehensive client profiles, history, and documentation
- **Appointment Scheduling** - Calendar integration, reminders, and telehealth links
- **Clinical Notes** - Secure, HIPAA-compliant note-taking system
- **Billing & Invoicing** - Professional billing with superbill generation
- **Assessment Tools** - Clinical assessment management and tracking

### Advanced Features
- **Analytics Dashboard** - Practice performance metrics and insights
- **Clinic Management** - Multi-staff clinic settings and configuration
- **Role-Based Access Control** - Secure permission management
- **Calendar Integration** - Google Calendar sync and scheduling
- **SMS Reminders** - Automated appointment reminders via Twilio

### Clinic Members Management 🆕
- **Staff Management** - Invite and manage clinic team members
- **Role-Based Permissions** - Admin, Therapist, and Assistant roles
- **Member Invitations** - Secure email-based invitation system
- **Activity Logging** - Comprehensive audit trail for compliance
- **Session Management** - Track member login sessions and activity

## 🏗️ Architecture

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Professional component library
- **next-intl** - Internationalization support

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data access control
- **Real-time subscriptions** - Live updates

### External Integrations
- **Google OAuth** - Calendar synchronization
- **Twilio** - SMS notifications
- **Email Services** - Member invitations (configurable)

## 🗄️ Database Schema

### Core Tables
- `clinics` - Clinic information and settings
- `user_profiles` - User account profiles
- `clients` - Client information and history
- `appointments` - Scheduling and session data
- `notes` - Clinical documentation
- `invoices` - Billing and payment records
- `assessments` - Clinical assessment data

### Clinic Members Management Tables 🆕
- `clinic_members` - Staff members and roles
- `member_permissions` - Granular permission system
- `member_activity_log` - Audit trail and compliance
- `member_invitations` - Invitation management
- `member_sessions` - Session tracking

## 🔐 Security & Permissions

### Role-Based Access Control (RBAC)
- **Admin** - Full system access and management
- **Therapist** - Clinical operations and client management
- **Assistant** - Limited access for administrative tasks

### Permission Matrix
| Resource | Admin | Therapist | Assistant |
|----------|-------|-----------|-----------|
| Clients | Full | Create/Read/Update | Read Only |
| Appointments | Full | Create/Read/Update | Create/Read |
| Notes | Full | Create/Read/Update | Read Only |
| Billing | Full | Create/Read | Read Only |
| Clinic Settings | Full | Read Only | No Access |
| Assessments | Full | Create/Read/Update | Read Only |

### Data Protection
- Row Level Security (RLS) policies
- Encrypted data transmission
- Audit logging for compliance
- Session management and timeout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials (optional)
- Twilio account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindtrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   ```

4. **Database setup**
   ```bash
   # Run Supabase migrations
   supabase db push
   
   # Or manually execute SQL files:
   # - supabase/clinic-members-schema.sql
   # - supabase/clinic-members-policies.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 Clinic Members Management

### Setting Up Your Team

1. **Initial Setup**
   - First user becomes clinic admin automatically
   - Access clinic settings via the "Clinic" tab
   - Navigate to "Team Members" sub-tab

2. **Inviting Members**
   - Click "Invite Member" button
   - Enter email address and select role
   - Add optional personal message
   - System sends secure invitation

3. **Role Management**
   - Admins can change member roles
   - Prevent removal of last admin
   - Automatic permission assignment

4. **Member Status**
   - **Pending** - Invitation sent, awaiting acceptance
   - **Active** - Member has accepted and is active
   - **Inactive** - Member temporarily disabled

### Security Features

- **Invitation Expiry** - 7-day invitation validity
- **Rate Limiting** - 5-minute cooldown between resends
- **Dependency Checks** - Prevent removal of members with active data
- **Audit Logging** - Complete action history for compliance

## 🔧 Configuration

### Email Integration
Configure your preferred email service for member invitations:
- SendGrid
- AWS SES
- SMTP server
- Or use console logging for development

### Permission Customization
Modify `member_permissions` table to customize access levels:
```sql
-- Example: Give therapists billing update access
UPDATE member_permissions 
SET granted = true 
WHERE role = 'therapist' AND resource = 'billing' AND action = 'update';
```

## 📱 API Endpoints

### Clinic Members
- `GET /api/clinics/members` - List clinic members
- `POST /api/clinics/members/invite` - Invite new member
- `PUT /api/clinics/members/[id]/role` - Update member role
- `DELETE /api/clinics/members/[id]` - Remove member
- `POST /api/clinics/members/[id]/resend-invite` - Resend invitation

### Authentication
All endpoints require valid Supabase authentication and appropriate role permissions.

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📈 Analytics & Reporting

### Practice Metrics
- Client retention rates
- Appointment completion rates
- Revenue tracking
- Session duration analysis
- No-show rate monitoring

### Custom Reports
- Date range selection
- Export functionality
- Performance insights
- AI-powered recommendations

## 🌐 Internationalization

Currently supported languages:
- English (en) - Default
- Turkish (tr)
- German (de)
- Spanish (es)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all production environment variables are configured:
- Database connections
- API keys
- External service credentials
- Security settings

### Database Migrations
```bash
supabase db push --db-url your_production_db_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment Guide](docs/deployment.md)

### Issues
- GitHub Issues for bug reports
- Feature requests welcome
- Security issues: please email directly

## 🔮 Roadmap

### Upcoming Features
- **Advanced Analytics** - Machine learning insights
- **Insurance Integration** - Claims processing
- **Telehealth Platform** - Built-in video calls
- **Mobile App** - iOS and Android
- **API Marketplace** - Third-party integrations

### Recent Additions
- ✅ **Clinic Members Management** - Complete staff management system
- ✅ **Advanced Analytics Dashboard** - Practice performance insights
- ✅ **Role-Based Access Control** - Secure permission management
- ✅ **Spanish Language Support** - Internationalization expansion

---

**MindTrack** - Empowering mental health professionals with comprehensive practice management tools.
