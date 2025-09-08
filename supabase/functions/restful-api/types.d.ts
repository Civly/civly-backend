export interface Profile {
  id: string;
  name?: string;
  surname?: string;
  birthday?: Date;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  updated_at?: string;
  avatar_url?: string;
}

export interface CV {
  id?: string;
  updated_at?: Date;
  user_id?: string;
  visibility?: 'draft' | 'private' | 'public';
  password?: string;
  name?: string;
  layout_configs?: LayoutConfigs
  personalInformation?: PersonalInformation
  expericence?: ExperienceItem[]
  education?: EducationItem[]
  skillGroups?: SkillGroup[]
}

export interface PersonalInformation {
  id: string;
  cv_id: string;
  name?: string;
  surname?: string;
  profile_url?: string;
  birthdate?: Date;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  xing?: string;
  website?: string;
  professionalTitle?: string;
  summary?: string;
}

export interface LayoutConfigs {
  id: string;
  cv_id: string;
  template_id: number;
  color_id: number;
  font_size: number;
}

export interface ExperienceItem {
  id: string;
  cv_id: string;
  role: string;
  company?: string;
  startDate?: Date;
  currentlyWorkingHere: boolean;
  endDate?: Date;
  location?: string;
  description?: string;
}

export interface EducationItem {
  id: string;
  cv_id: string;
  degree?: string;
  institution?: string;
  startDate?: Date;
  currentlyStudyingHere?: boolean;
  endDate?: Date;
  location?: string;
  description?: string;    
}

export interface SkillGroup {
  id: string;
  cv_id: string;
  name?: string;           
  order?: number;  
  skills?: Skill[];         
}

export interface Skill {
  id: string;
  skillgroup_id: string;
  order?: number;
  name?: string; 
}