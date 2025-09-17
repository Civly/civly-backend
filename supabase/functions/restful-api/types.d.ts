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
  updatedAt?: string;
  avatarUrl?: string;
}

export interface CV {
  id: string;
  updatedAt?: Date;
  userId: string;
  visibility?: 'draft' | 'private' | 'public';
  password?: string;
  name?: string;
  layoutConfigs?: LayoutConfigs
  personalInformation?: PersonalInformation
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skillGroups?: SkillGroup[]
}

export interface PersonalInformation {
  id?: string;
  cvId?: string;
  userId?: string;
  name?: string;
  surname?: string;
  profileUrl?: string;
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
  id?: string;
  cvId?: string;
  userId?: string;
  templateId?: number;
  colorId?: number;
  fontSize?: number;
}

export interface ExperienceItem {
  id?: string;
  cvId?: string;
  userId?: string;
  role?: string;
  company?: string;
  startDate?: Date;
  currentlyWorkingHere?: boolean;
  endDate?: Date;
  location?: string;
  description?: string;
}

export interface EducationItem {
  id?: string;
  cvId?: string;
  userId?: string;
  degree?: string;
  institution?: string;
  startDate?: Date;
  currentlyStudyingHere?: boolean;
  endDate?: Date;
  location?: string;
  description?: string;    
}

export interface SkillGroup {
  id?: string;
  cvId?: string;
  userId?: string;
  name?: string;           
  order?: number;  
  skills?: Skill[];         
}

export interface Skill {
  id?: string;
  skillgroupId?: string;
  userId?: string;
  name?: string; 
  order?: number;
}

export interface FailedLoginAttempt {
  id?: string;
  ip?: string;
  cvId: string;
  failedAttempts?: number;
  lockedUntil?: Date;
  updatedAt?: Date;
  createdAt?: Date;
}
