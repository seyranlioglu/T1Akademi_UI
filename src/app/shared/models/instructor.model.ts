export interface Instructor {
    id: string;
    appUserId: string;
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    imageUrl?: string;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        website?: string;
    };
    courses?: any[]; // İleride TrainingCard modeli ile değiştirebiliriz
    studentCount?: number;
    courseCount?: number;
    rating?: number;
    createdDate?: Date;
}