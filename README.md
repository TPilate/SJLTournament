# SJL Tournament - Tournament Management Application

A comprehensive web application for managing multi-team tournaments with real-time scoring, built with Nuxt 3, TypeScript, Prisma, and Socket.io.

## 🚀 Features

### Tournament Management
- Create and manage tournaments with various formats:
  - Round Robin
  - Single Elimination
  - Double Elimination
  - Group Stage then Knockout
  - Hybrid formats
- Automatic stage and pool generation based on tournament format
- Flexible tournament configuration (max teams, players per team, rules)

### Team Management
- Create teams with up to 6 players each
- Assign team captains
- Manage team participation in tournaments
- Prevent duplicate team membership in the same tournament

### Match Management
- Schedule matches between teams
- Assign referee teams (cannot be one of the playing teams)
- Two match modes:
  - **Timed**: Fixed duration matches
  - **Score Target**: First to reach X points wins
- Automatic match locking based on rules:
  - Time-based: Locks when duration expires
  - Score-based: Locks when target score is reached
- Manual override by administrators

### Real-time Scoring
- Live score updates via WebSocket
- Referee teams can update scores in real-time
- All connected clients receive instant updates
- Score history and audit trail

### User Roles & Permissions
- **Admin**: Full access to all features, can manage tournaments, teams, matches, and users
- **Player**: Can view tournaments, join teams, referee matches, and update scores for matches they referee

### Dashboards
- **Admin Dashboard**: Overview of all tournaments, teams, matches, and activity
- **Player Dashboard**: Personal view of teams, upcoming matches to play, and matches to referee

## 🛠 Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Composition API, TypeScript)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + Custom components
- **Backend**: Nuxt Server Routes (Nitro)
- **Database**: [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- **Authentication**: JWT with httpOnly cookies
- **Real-time**: [Socket.io](https://socket.io/)
- **Deployment**: Docker + docker-compose

## 📦 Project Structure

```
sjl-tournament/
├── assets/
│   └── css/
│       ├── main.css          # Custom styles
│       └── tailwind.css      # Tailwind imports
├── components/
│   ├── dashboard/
│   │   ├── AdminDashboard.vue
│   │   └── PlayerDashboard.vue
│   └── ...
├── composables/
│   ├── usePermissions.ts      # Permission checking utilities
│   └── useSocket.ts          # Socket.io client wrapper
├── layouts/
│   ├── auth.vue             # Auth layout (login, register)
│   └── default.vue          # Main application layout
├── middleware/
│   └── auth.global.ts       # Global authentication middleware
├── pages/
│   ├── dashboard.vue        # Main dashboard
│   ├── index.vue            # Home page
│   ├── login.vue            # Login page
│   ├── register.vue         # Registration page
│   └── matches/
│       └── [id]/
│           └── live.vue      # Live match page with real-time scoring
├── plugins/
│   ├── pinia.ts             # Pinia initialization
│   └── socket.io.ts         # Socket.io server plugin
├── prisma/
│   └── schema.prisma        # Database schema
├── server/
│   ├── api/
│   │   ├── auth/            # Authentication routes
│   │   ├── matches/         # Match routes
│   │   ├── players/         # Player routes
│   │   ├── teams/           # Team routes
│   │   └── tournaments/     # Tournament routes
│   ├── middleware/
│   │   └── auth.ts          # Server-side auth middleware
│   └── utils/
│       ├── auth.ts          # Auth utilities (JWT, password hashing)
│       └── prisma.ts        # Prisma client singleton
├── stores/
│   ├── auth.ts              # Authentication store
│   ├── matches.ts           # Match store
│   └── tournaments.ts       # Tournament store
├── types/
│   └── index.ts             # TypeScript type definitions
├── .env.example             # Environment variables template
├── .gitignore
├── app.vue                  # Root component
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker configuration
├── nuxt.config.ts           # Nuxt configuration
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 📋 Data Model

### Entities

- **User**: Authentication and user information
- **Tournament**: Tournament details and configuration
- **Stage**: Tournament stages (group, bracket, final, etc.)
- **Pool**: Groups within stages
- **Team**: Team information and roster
- **Player**: User-team association
- **Match**: Match details, scores, and status
- **MatchEvent**: Audit trail for score changes

### Key Relationships

- Tournament → Stage → Pool → Team
- Tournament → Match
- Team → Player → User
- Match → Team (A, B, Referee)
- Match → MatchEvent

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TPilate/SJLTournament.git
   cd SJLTournament
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database**:
   ```bash
   npx prisma migrate dev
   npx prisma db push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Start Socket.io server** (in separate terminal):
   ```bash
   # The Socket.io server runs with the Nuxt dev server
   # No separate command needed
   ```

7. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)

### Using Docker

1. **Start services**:
   ```bash
   docker-compose up -d
   ```

2. **Initialize database**:
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```

3. **Access the application**:
   - Application: [http://localhost:3000](http://localhost:3000)
   - Prisma Studio: [http://localhost:5555](http://localhost:5555)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/sjl_tournament` |
| `JWT_SECRET` | JWT signing secret | Random string |
| `SOCKET_IO_PORT` | Socket.io server port | `3001` |
| `SOCKET_IO_CORS_ORIGIN` | CORS origin for Socket.io | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Key features:

- **Enums** for status, roles, formats, etc.
- **Relations** between all entities
- **Indexes** for performance
- **Cascade deletes** where appropriate

To update the schema:

1. Modify `prisma/schema.prisma`
2. Run migrations:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Generate client:
   ```bash
   npx prisma generate
   ```

## 🎯 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Tournaments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tournaments` | List all tournaments |
| POST | `/api/tournaments` | Create tournament |
| GET | `/api/tournaments/:id` | Get tournament details |
| PUT | `/api/tournaments/:id` | Update tournament |
| DELETE | `/api/tournaments/:id` | Delete tournament |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/:id` | Get team details |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List all matches |
| POST | `/api/matches` | Create match |
| PUT | `/api/matches/:id/score` | Update match score |

### Players

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/players` | Add player to team |

## 🔌 WebSocket Events

### Connection

```javascript
// Connect to Socket.io server
const socket = io('http://localhost:3001', {
  withCredentials: true
})

// Authenticate
socket.emit('authenticate', 'your-jwt-token')

// Join rooms
socket.emit('join:match', 'match-id')
socket.emit('join:tournament', 'tournament-id')
```

### Events

| Event | Direction | Description | Data |
|-------|-----------|-------------|------|
| `authenticate` | Client → Server | Authenticate connection | `{ token: string }` |
| `authenticated` | Server → Client | Authentication response | `{ success: boolean, userId: string, role: string }` |
| `join:match` | Client → Server | Join match room | `{ matchId: string }` |
| `leave:match` | Client → Server | Leave match room | `{ matchId: string }` |
| `join:tournament` | Client → Server | Join tournament room | `{ tournamentId: string }` |
| `match:updateScore` | Client → Server | Update match score | `{ matchId: string, scoreA: number, scoreB: number }` |
| `match:start` | Client → Server | Start a match | `{ matchId: string }` |
| `match:update` | Server → Client | Match update broadcast | `{ event: string, data: SocketMatchUpdate, timestamp: Date }` |
| `error` | Server → Client | Error message | `{ message: string }` |

## 📏 Business Rules

### Tournament Rules

1. **Team Size**: Maximum 6 players per team
2. **Unique Membership**: A player can belong to only one team per tournament
3. **Referee Assignment**: Referee team cannot be one of the playing teams
4. **Match Locking**: 
   - Automatic locking when match conditions are met (time expired or target score reached)
   - Only administrators can unlock a locked match
   - All score changes after locking are logged in the audit trail

### Permission Rules

- **Admin**: Can perform all actions on all entities
- **Player**: 
  - Can view public tournament information
  - Can view their own teams and matches
  - Can update scores only for matches where their team is the referee
  - Cannot modify locked matches

## 🎨 UI Components

### Layouts
- `default.vue`: Main application layout with navigation
- `auth.vue`: Authentication pages layout

### Pages
- `index.vue`: Home page with features overview
- `login.vue`: User login
- `register.vue`: User registration
- `dashboard.vue`: Role-based dashboard
- `matches/[id]/live.vue`: Live match scoring page

### Components
- `AdminDashboard.vue`: Admin dashboard with stats and quick actions
- `PlayerDashboard.vue`: Player dashboard with teams and matches

## 🔒 Security

### Authentication
- JWT tokens with httpOnly cookies
- Token expiration: 24 hours
- Refresh token: 7 days
- Secure password hashing with bcrypt (12 rounds)

### Authorization
- Role-based access control (RBAC)
- Server-side permission checks
- Client-side permission utilities
- Protected routes with middleware

### Data Protection
- Sensitive data never exposed in client-side code
- Database connection strings in environment variables
- JWT secret in environment variables

## 🚀 Deployment

### Docker

1. **Build image**:
   ```bash
   docker build -t sjl-tournament .
   ```

2. **Run container**:
   ```bash
   docker run -p 3000:3000 -p 3001:3001 \
     -e DATABASE_URL=your_database_url \
     -e JWT_SECRET=your_jwt_secret \
     sjl-tournament
   ```

### Manual Deployment

1. **Build application**:
   ```bash
   npm run build
   ```

2. **Start server**:
   ```bash
   npm run preview
   ```

3. **Start Socket.io server** (if separate):
   ```bash
   node server/socket.io.js
   ```

## 🧪 Testing

### Manual Testing

1. **Register as admin**:
   - Use the registration form with `role: ADMIN`
   - Or manually set role in database

2. **Create tournament**:
   - Admin can create tournaments with various formats
   - Verify stages are created automatically

3. **Create teams**:
   - Admin can create teams
   - Assign captains and add players

4. **Create matches**:
   - Admin can schedule matches
   - Assign referee teams

5. **Test scoring**:
   - Login as referee team member
   - Open live match page
   - Update scores and verify real-time updates
   - Test automatic locking

### Automated Testing

To add automated tests:

1. Install testing dependencies:
   ```bash
   npm install --save-dev @vue/test-utils vitest jsdom
   ```

2. Create test files in `__tests__/` directory

3. Run tests:
   ```bash
   npm run test
   ```

## 📚 Documentation

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Nuxt 3](https://nuxt.com/)
- Database powered by [Prisma](https://www.prisma.io/)
- Real-time updates with [Socket.io](https://socket.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**SJL Tournament** - Manage your tournaments with ease!

*Built with ❤️ and TypeScript*
