export interface DashboardStatsDto {
    completedTrainingsCount: number;
    inProgressTrainingsCount: number;
    totalCertificates: number;
}

export interface ContinueTrainingDto {
    trainingId: number;
    title: string;
    imageUrl: string;
    progress: number;
    lastLessonName: string;
}

export interface TrainingCardDto {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    instructorName: string;
    isAssigned: boolean;
    rating: number;
    // Takvim ve Durum Alanları
    accessStatus?: string; // 'Active', 'NotStarted', 'Expired'
    startDate?: Date;
    dueDate?: Date;
    assignDate?: Date;
    isCompleted?: boolean;
}

// Backend'deki UserCertificateDto ile birebir uyumlu
export interface UserCertificateDto {
    certificateId: string;      // Guid
    templateTitle: string;      // Gold, Silver vb.
    trainingName: string;
    
    certificateDate?: Date;     
    constructorName: string;
    startDate?: Date;
    endDate?: Date;
    trainerName: string;
    trainerTitle: string;
    numberOfLecture: number;
    providerName: string;
    providerTitle: string;
    verificationURL: string;
    isActive: boolean;
}