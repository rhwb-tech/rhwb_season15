export interface Program {
  name: string;
  url: string;
  description?: string;
  category?: string;
}

export interface ProgramCategory {
  name: string;
  programs: Program[];
} 