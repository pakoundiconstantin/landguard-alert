export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertes: {
        Row: {
          created_at: string
          decision_id: string | null
          id: string
          litige_id: string | null
          message: string
          parcelle_id: string | null
          plainte_id: string | null
          priorite: Database["public"]["Enums"]["niveau_priorite"]
          traitee: boolean
          traitee_le: string | null
          traitee_par: string | null
          type_evenement: string
        }
        Insert: {
          created_at?: string
          decision_id?: string | null
          id?: string
          litige_id?: string | null
          message: string
          parcelle_id?: string | null
          plainte_id?: string | null
          priorite?: Database["public"]["Enums"]["niveau_priorite"]
          traitee?: boolean
          traitee_le?: string | null
          traitee_par?: string | null
          type_evenement: string
        }
        Update: {
          created_at?: string
          decision_id?: string | null
          id?: string
          litige_id?: string | null
          message?: string
          parcelle_id?: string | null
          plainte_id?: string | null
          priorite?: Database["public"]["Enums"]["niveau_priorite"]
          traitee?: boolean
          traitee_le?: string | null
          traitee_par?: string | null
          type_evenement?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertes_litige_id_fkey"
            columns: ["litige_id"]
            isOneToOne: false
            referencedRelation: "litiges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertes_parcelle_id_fkey"
            columns: ["parcelle_id"]
            isOneToOne: false
            referencedRelation: "parcelles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertes_plainte_id_fkey"
            columns: ["plainte_id"]
            isOneToOne: false
            referencedRelation: "plaintes"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string
          created_by: string | null
          date_decision: string
          date_transmission: string | null
          document_url: string | null
          id: string
          litige_id: string
          numero: string
          resume: string
          statut: string
          tribunal: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_decision?: string
          date_transmission?: string | null
          document_url?: string | null
          id?: string
          litige_id: string
          numero: string
          resume: string
          statut?: string
          tribunal: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_decision?: string
          date_transmission?: string | null
          document_url?: string | null
          id?: string
          litige_id?: string
          numero?: string
          resume?: string
          statut?: string
          tribunal?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_litige_id_fkey"
            columns: ["litige_id"]
            isOneToOne: false
            referencedRelation: "litiges"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_parcelle: {
        Row: {
          acteur: string
          date_evenement: string
          details: string | null
          evenement: string
          id: string
          parcelle_id: string
          statut: string | null
          user_id: string | null
        }
        Insert: {
          acteur?: string
          date_evenement?: string
          details?: string | null
          evenement: string
          id?: string
          parcelle_id: string
          statut?: string | null
          user_id?: string | null
        }
        Update: {
          acteur?: string
          date_evenement?: string
          details?: string | null
          evenement?: string
          id?: string
          parcelle_id?: string
          statut?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_parcelle_parcelle_id_fkey"
            columns: ["parcelle_id"]
            isOneToOne: false
            referencedRelation: "parcelles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_activite: {
        Row: {
          action: string
          created_at: string
          entite: string | null
          entite_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entite?: string | null
          entite_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entite?: string | null
          entite_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      litiges: {
        Row: {
          created_at: string
          created_by: string | null
          date_cloture: string | null
          date_ouverture: string
          id: string
          numero: string
          objet: string
          parcelle_id: string
          parties: string | null
          plainte_id: string | null
          statut: Database["public"]["Enums"]["statut_litige"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_cloture?: string | null
          date_ouverture?: string
          id?: string
          numero: string
          objet: string
          parcelle_id: string
          parties?: string | null
          plainte_id?: string | null
          statut?: Database["public"]["Enums"]["statut_litige"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_cloture?: string | null
          date_ouverture?: string
          id?: string
          numero?: string
          objet?: string
          parcelle_id?: string
          parties?: string | null
          plainte_id?: string | null
          statut?: Database["public"]["Enums"]["statut_litige"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "litiges_parcelle_id_fkey"
            columns: ["parcelle_id"]
            isOneToOne: false
            referencedRelation: "parcelles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "litiges_plainte_id_fkey"
            columns: ["plainte_id"]
            isOneToOne: false
            referencedRelation: "plaintes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          alerte_id: string | null
          created_at: string
          id: string
          lu: boolean
          message: string
          priorite: Database["public"]["Enums"]["niveau_priorite"]
          titre: string
          user_id: string
        }
        Insert: {
          alerte_id?: string | null
          created_at?: string
          id?: string
          lu?: boolean
          message: string
          priorite?: Database["public"]["Enums"]["niveau_priorite"]
          titre: string
          user_id: string
        }
        Update: {
          alerte_id?: string | null
          created_at?: string
          id?: string
          lu?: boolean
          message?: string
          priorite?: Database["public"]["Enums"]["niveau_priorite"]
          titre?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_alerte_id_fkey"
            columns: ["alerte_id"]
            isOneToOne: false
            referencedRelation: "alertes"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelles: {
        Row: {
          code_parcelle: string
          commune: string
          created_at: string
          created_by: string | null
          geometrie: Json | null
          id: string
          latitude: number
          localite: string | null
          longitude: number
          observations: string | null
          prefecture: string
          proprietaire: string | null
          reference_cadastrale: string
          statut: Database["public"]["Enums"]["statut_parcelle"]
          superficie_m2: number
          type_titre: string | null
          updated_at: string
        }
        Insert: {
          code_parcelle: string
          commune: string
          created_at?: string
          created_by?: string | null
          geometrie?: Json | null
          id?: string
          latitude: number
          localite?: string | null
          longitude: number
          observations?: string | null
          prefecture: string
          proprietaire?: string | null
          reference_cadastrale: string
          statut?: Database["public"]["Enums"]["statut_parcelle"]
          superficie_m2?: number
          type_titre?: string | null
          updated_at?: string
        }
        Update: {
          code_parcelle?: string
          commune?: string
          created_at?: string
          created_by?: string | null
          geometrie?: Json | null
          id?: string
          latitude?: number
          localite?: string | null
          longitude?: number
          observations?: string | null
          prefecture?: string
          proprietaire?: string | null
          reference_cadastrale?: string
          statut?: Database["public"]["Enums"]["statut_parcelle"]
          superficie_m2?: number
          type_titre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plaintes: {
        Row: {
          created_at: string
          created_by: string | null
          date_depot: string
          description: string | null
          id: string
          motif: string
          numero: string
          parcelle_id: string
          partie_adverse: string | null
          piece_jointe_url: string | null
          plaignant: string
          statut: Database["public"]["Enums"]["statut_plainte"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_depot?: string
          description?: string | null
          id?: string
          motif: string
          numero: string
          parcelle_id: string
          partie_adverse?: string | null
          piece_jointe_url?: string | null
          plaignant: string
          statut?: Database["public"]["Enums"]["statut_plainte"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_depot?: string
          description?: string | null
          id?: string
          motif?: string
          numero?: string
          parcelle_id?: string
          partie_adverse?: string | null
          piece_jointe_url?: string | null
          plaignant?: string
          statut?: Database["public"]["Enums"]["statut_plainte"]
        }
        Relationships: [
          {
            foreignKeyName: "plaintes_parcelle_id_fkey"
            columns: ["parcelle_id"]
            isOneToOne: false
            referencedRelation: "parcelles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actif: boolean
          created_at: string
          email: string
          fonction: string | null
          id: string
          nom_complet: string
          prefecture: string | null
        }
        Insert: {
          actif?: boolean
          created_at?: string
          email?: string
          fonction?: string | null
          id: string
          nom_complet?: string
          prefecture?: string | null
        }
        Update: {
          actif?: boolean
          created_at?: string
          email?: string
          fonction?: string | null
          id?: string
          nom_complet?: string
          prefecture?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      creer_alerte: {
        Args: {
          _decision: string
          _litige: string
          _message: string
          _parcelle: string
          _plainte: string
          _priorite: Database["public"]["Enums"]["niveau_priorite"]
          _type: string
        }
        Returns: string
      }
      est_actif: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrateur" | "cadastre" | "tribunal" | "consultation"
      niveau_priorite: "faible" | "moyen" | "eleve" | "critique"
      statut_litige:
        | "nouveau"
        | "en_cours"
        | "en_attente_decision"
        | "decide"
        | "resolu"
        | "cloture"
      statut_parcelle:
        | "actif"
        | "en_litige"
        | "decision_rendue"
        | "mis_a_jour"
        | "suspendu"
      statut_plainte:
        | "enregistree"
        | "en_examen"
        | "transformee_en_litige"
        | "rejetee"
        | "close"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrateur", "cadastre", "tribunal", "consultation"],
      niveau_priorite: ["faible", "moyen", "eleve", "critique"],
      statut_litige: [
        "nouveau",
        "en_cours",
        "en_attente_decision",
        "decide",
        "resolu",
        "cloture",
      ],
      statut_parcelle: [
        "actif",
        "en_litige",
        "decision_rendue",
        "mis_a_jour",
        "suspendu",
      ],
      statut_plainte: [
        "enregistree",
        "en_examen",
        "transformee_en_litige",
        "rejetee",
        "close",
      ],
    },
  },
} as const
