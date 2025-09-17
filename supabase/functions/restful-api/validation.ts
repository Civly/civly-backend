import type { CV, LayoutConfigs, PersonalInformation, ExperienceItem, EducationItem, SkillGroup, Skill } from './types.d.ts';
import * as z from "npm:zod@latest";
import {encode} from 'npm:html-entities@latest';
import { cvDataSchema } from './cv_data_schema.ts';

export function validateCV2(cv: CV){
    try {
        return cvDataSchema.parse(cv);
    } catch (error) {
        throw error;
    }
}

export function validateCV(cv: CV){
    const schema = z.object({
        name: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        password: z.int().gt(-1).lt(1000000).optional(),
        visibility: z.literal(['draft', 'private', 'public']).optional()
    })
    
    try {
        return schema.parse(cv);
    } catch (error) {
        throw error;
    }
}

export function validateLayoutConfigs(layoutConfigs: LayoutConfigs){
    const schema = z.object({
        id: z.uuid(),
        cvId: z.uuid(),
        templateId: z.int().optional(),
        colorId: z.int().optional(),
        fontSize: z.int().optional()
    })
    
    try {
        return schema.parse(layoutConfigs);
    } catch (error) {
        throw error;
    }

}

export function validatePersonalInformation(personalInformation: PersonalInformation){
    const schema = z.object({
        id: z.uuid(),
        cvId: z.uuid(),
        name: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        surname: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        profileUrl: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        birthdate: z.datetime().optional(),
        email: z.email().optional(),
        phone: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        location: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        linkedin: z.url().optional(),
        xing: z.url().optional(),
        website: z.url().optional(),
        professionalTitle: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        summary: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
    })
    
    try {
        return schema.parse(personalInformation);
    } catch (error) {
        throw error;
    }

}

export function validateExperienceItem(experienceItem: ExperienceItem){
    const schema = z.object({
        role: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        company: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        startDate: z.datetime().optional(),
        currentlyWorkingHere: z.boolean().optional(),
        endDate: z.datetime().optional(),
        location: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        description: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
    })
    
    try {
        return schema.parse(experienceItem);
    } catch (error) {
        throw error;
    }

}

export function validateEducationItem(educationItem: EducationItem){
    const schema = z.object({
        degree: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        institution: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        startDate: z.datetime().optional(),
        currentlyStudyingHere: z.boolean().optional(),
        endDate: z.datetime().optional(),
        location: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        description: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
    })
    
    try {
        return schema.parse(educationItem);
    } catch (error) {
        throw error;
    }

}

export function validateSkillGroup(skillGroup: SkillGroup){
    const schema = z.object({
        name: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        order: z.int().optional()
    })
    
    try {
        return schema.parse(skillGroup);
    } catch (error) {
        throw error;
    }

}

export function validateSkill(skill: Skill){
    const schema = z.object({
        name: z.string().optional().transform((val) => {
            return val ? encode(val) : undefined;
        }),
        order: z.int().optional()
    })
    
    try {
        return schema.parse(skill);
    } catch (error) {
        throw error;
    }

}
