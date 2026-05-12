export type UserRole = "coach" | "athlete";
export type WorkoutType = "easy" | "tempo" | "intervals" | "long_run" | "rest";
export type WorkoutStatus = "pending" | "completed" | "skipped";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface AthleteProfile {
  id: string;
  coach_id: string;
  date_of_birth: string | null;
  weekly_km_goal: number | null;
  notes: string | null;
}

export interface Workout {
  id: string;
  athlete_id: string;
  coach_id: string;
  date: string;
  type: WorkoutType;
  title: string;
  description: string | null;
  planned_distance_km: number | null;
  planned_duration_minutes: number | null;
  status: WorkoutStatus;
  created_at: string;
}

export interface WorkoutResult {
  id: string;
  workout_id: string;
  athlete_id: string;
  actual_distance_km: number | null;
  actual_duration_minutes: number | null;
  heart_rate_avg: number | null;
  notes: string | null;
  completed_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      athlete_profiles: {
        Row: AthleteProfile;
        Insert: {
          id: string;
          coach_id: string;
          date_of_birth?: string | null;
          weekly_km_goal?: number | null;
          notes?: string | null;
        };
        Update: {
          coach_id?: string;
          date_of_birth?: string | null;
          weekly_km_goal?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      workouts: {
        Row: Workout;
        Insert: {
          id?: string;
          athlete_id: string;
          coach_id: string;
          date: string;
          type: WorkoutType;
          title: string;
          description?: string | null;
          planned_distance_km?: number | null;
          planned_duration_minutes?: number | null;
          status?: WorkoutStatus;
          created_at?: string;
        };
        Update: {
          date?: string;
          type?: WorkoutType;
          title?: string;
          description?: string | null;
          planned_distance_km?: number | null;
          planned_duration_minutes?: number | null;
          status?: WorkoutStatus;
        };
        Relationships: [];
      };
      workout_results: {
        Row: WorkoutResult;
        Insert: {
          id?: string;
          workout_id: string;
          athlete_id: string;
          actual_distance_km?: number | null;
          actual_duration_minutes?: number | null;
          heart_rate_avg?: number | null;
          notes?: string | null;
          completed_at?: string;
        };
        Update: {
          actual_distance_km?: number | null;
          actual_duration_minutes?: number | null;
          heart_rate_avg?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
