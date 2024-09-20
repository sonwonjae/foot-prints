export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      auth_tokens: {
        Row: {
          accessToken: string;
          accessTokenExpires: string;
          id: string;
          refreshToken: string;
          refreshTokenExpires: string;
          userId: string;
        };
        Insert: {
          accessToken?: string;
          accessTokenExpires?: string;
          id?: string;
          refreshToken?: string;
          refreshTokenExpires?: string;
          userId: string;
        };
        Update: {
          accessToken?: string;
          accessTokenExpires?: string;
          id?: string;
          refreshToken?: string;
          refreshTokenExpires?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'auth_tokens_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      guestbooks: {
        Row: {
          content: string;
          createdAt: string;
          id: string;
          updatedAt: string;
        };
        Insert: {
          content?: string;
          createdAt?: string;
          id?: string;
          updatedAt?: string;
        };
        Update: {
          content?: string;
          createdAt?: string;
          id?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      guestbooks__locations: {
        Row: {
          createdAt: string;
          guestbookId: string;
          id: string;
          locationId: string;
        };
        Insert: {
          createdAt?: string;
          guestbookId: string;
          id?: string;
          locationId: string;
        };
        Update: {
          createdAt?: string;
          guestbookId?: string;
          id?: string;
          locationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guestbooks__locations_guestbookId_fkey';
            columns: ['guestbookId'];
            isOneToOne: false;
            referencedRelation: 'guestbooks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guestbooks__locations_locationId_fkey';
            columns: ['locationId'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
        ];
      };
      locations: {
        Row: {
          createdAt: string;
          id: string;
          landType: Database['public']['Enums']['landType'] | null;
          updatedAt: string;
          variation: number;
          x: number;
          z: number;
        };
        Insert: {
          createdAt?: string;
          id?: string;
          landType?: Database['public']['Enums']['landType'] | null;
          updatedAt?: string;
          variation?: number;
          x: number;
          z: number;
        };
        Update: {
          createdAt?: string;
          id?: string;
          landType?: Database['public']['Enums']['landType'] | null;
          updatedAt?: string;
          variation?: number;
          x?: number;
          z?: number;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatarUrl: string;
          createdAt: string;
          email: string;
          id: string;
          name: string;
          provider: Database['public']['Enums']['provider'] | null;
          providerId: string;
          updatedAt: string;
        };
        Insert: {
          avatarUrl?: string;
          createdAt?: string;
          email?: string;
          id?: string;
          name?: string;
          provider?: Database['public']['Enums']['provider'] | null;
          providerId?: string;
          updatedAt?: string;
        };
        Update: {
          avatarUrl?: string;
          createdAt?: string;
          email?: string;
          id?: string;
          name?: string;
          provider?: Database['public']['Enums']['provider'] | null;
          providerId?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      users__guestbooks: {
        Row: {
          created_at: string;
          guestbookId: string;
          id: number;
          userId: string;
        };
        Insert: {
          created_at?: string;
          guestbookId?: string;
          id?: number;
          userId?: string;
        };
        Update: {
          created_at?: string;
          guestbookId?: string;
          id?: number;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users__guestbooks_guestbookId_fkey';
            columns: ['guestbookId'];
            isOneToOne: false;
            referencedRelation: 'guestbooks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_guestbooks_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      landType:
        | 'time-capsule'
        | 'guest-book'
        | 'wasteland'
        | 'fence'
        | 'grass'
        | 'mistake.9'
        | 'mistake.8'
        | 'mistake.7'
        | 'mistake.6'
        | 'mistake.5'
        | 'mistake.4'
        | 'mistake.3'
        | 'mistake.2'
        | 'mistake.1'
        | 'mistake.0';
      provider: 'github';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;
