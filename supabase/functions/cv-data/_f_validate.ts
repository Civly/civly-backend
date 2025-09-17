import { CvData, cvDataSchema } from "./_s_cvDataSchema.ts";

export function validateCV(cv: CvData){
    try {
        return cvDataSchema.parse(cv);
    } catch (error) {
        throw error;
    }
}