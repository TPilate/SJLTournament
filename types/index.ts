// User types
export type UserRole = 'ADMIN' | 'PLAYER'

export interface User {
  id: string
  email: string
  role: UserRole
  pseudo?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserWithPassword extends User {
  passwordHash: string
}

// Tournament types
export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TournamentFormat = 'ROUND_ROBIN' | 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'GROUP_STAGE_THEN_KNOCKOUT' | 'HYBRID'

export interface Tournament {
  id: string
  name: string
  description?: string
  format: TournamentFormat
  status: TournamentStatus
  startDate?: Date
  endDate?: Date
  maxTeams: number
  maxPlayersPerTeam: number
  rules?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Stage types
export type StageType = 'GROUP' | 'BRACKET' | 'FINAL' | 'THIRD_PLACE'

export interface Stage {
  id: string
  tournamentId: string
  type: StageType
  name: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Pool types
export interface Pool {
  id: string
  stageId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// Team types
export interface Team {
  id: string
  name: string
  tournamentId: string
  captainId: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamWithRelations extends Team {
  captain: User
  players: Player[]
  pools: Pool[]
}

// Player types
export interface Player {
  id: string
  userId: string
  teamId: string
  pseudo?: string
  createdAt: Date
  updatedAt: Date
}

export interface PlayerWithUser extends Player {
  user: User
}

// Match types
export type MatchMode = 'TIMED' | 'SCORE_TARGET'
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Match {
  id: string
  tournamentId: string
  stageId?: string
  poolId?: string
  teamAId: string
  teamBId: string
  refereeTeamId?: string
  mode: MatchMode
  durationMinutes?: number
  targetScore?: number
  scoreA: number
  scoreB: number
  status: MatchStatus
  startTime?: Date
  endTime?: Date
  locked: boolean
  lastEditorId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MatchWithRelations extends Match {
  tournament: Tournament
  stage?: Stage
  pool?: Pool
  teamA: Team
  teamB: Team
  refereeTeam?: Team
  lastEditor?: User
  events: MatchEvent[]
}

// Match Event types
export interface MatchEvent {
  id: string
  matchId: string
  editorId: string
  oldScoreA: number
  oldScoreB: number
  newScoreA: number
  newScoreB: number
  reason?: string
  createdAt: Date
}

export interface MatchEventWithRelations extends MatchEvent {
  match: Match
  editor: User
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  pseudo?: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  pseudo?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  pseudo?: string
  role?: UserRole
}

export interface CreateTournamentForm {
  name: string
  description?: string
  format: TournamentFormat
  maxTeams?: number
  maxPlayersPerTeam?: number
  startDate?: Date
  endDate?: Date
  rules?: Record<string, unknown>
}

export interface CreateTeamForm {
  name: string
  tournamentId: string
  captainId: string
}

export interface CreateMatchForm {
  tournamentId: string
  stageId?: string
  poolId?: string
  teamAId: string
  teamBId: string
  refereeTeamId?: string
  mode: MatchMode
  durationMinutes?: number
  targetScore?: number
  startTime?: Date
  notes?: string
}

export interface UpdateMatchScoreForm {
  scoreA?: number
  scoreB?: number
  forceUnlock?: boolean // Only for admins
}

// Dashboard types
export interface PlayerDashboardData {
  user: AuthUser
  teams: TeamWithRelations[]
  upcomingMatches: MatchWithRelations[]
  refereeMatches: MatchWithRelations[]
  pastMatches: MatchWithRelations[]
}

export interface AdminDashboardData {
  tournaments: Tournament[]
  totalUsers: number
  totalTeams: number
  totalMatches: number
  recentActivity: MatchEvent[]
}

// WebSocket types
export type SocketEventType = 
  | 'match:scoreUpdated'
  | 'match:statusChanged'
  | 'match:locked'
  | 'match:unlocked'
  | 'tournament:updated'
  | 'team:updated'

export interface SocketMatchUpdate {
  matchId: string
  scoreA: number
  scoreB: number
  status: MatchStatus
  locked: boolean
  updatedAt: Date
}

export interface SocketMessage<T> {
  event: SocketEventType
  data: T
  timestamp: Date
}

// Permission types
export type Permission = 
  | 'tournament:create'
  | 'tournament:read'
  | 'tournament:update'
  | 'tournament:delete'
  | 'team:create'
  | 'team:read'
  | 'team:update'
  | 'team:delete'
  | 'match:create'
  | 'match:read'
  | 'match:update'
  | 'match:delete'
  | 'match:score'
  | 'match:lock'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'tournament:create',
    'tournament:read',
    'tournament:update',
    'tournament:delete',
    'team:create',
    'team:read',
    'team:update',
    'team:delete',
    'match:create',
    'match:read',
    'match:update',
    'match:delete',
    'match:score',
    'match:lock',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
  ],
  PLAYER: [
    'tournament:read',
    'team:read',
    'match:read',
    'match:score', // Only for matches they referee
  ],
}
