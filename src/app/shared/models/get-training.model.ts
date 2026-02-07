export interface GetTraining {
    id: number;
    title: string;
    subTitle?: string;
    description?: string;
    headerImage?: string;
    trailer?: string;
    langCode?: string;
    
    // İstatistikler
    totalLectureCount?: number;
    totalDurationMinutes?: number;
    rating?: number;
    reviewCount?: number;
    studentCount?: number;
    progressPercentage?: number; // UI için eklendi

    // Eğitmen
    instructorTitle?: string;
    instructorName?: string;
    instructorPicturePath?: string;
    instructorDescription?: string;
    instructorTotalStudents?: number;
    instructorTotalCourses?: number;
    instructorRating?: number;

    // Fiyat
    amount?: number;
    currentAmount?: number;
    discountRate?: number;
    priceTierId?: number;

    // Listeler ve İlişkiler (EKSİK OLANLAR EKLENDİ)
    resumeContext?: ActiveContentResumeDto;
    trainingSections: TrainingSectionDto[];
    
    // Alt Bilgiler
    whatYouWillLearns?: TrainingAttributeDto[];
    requirements?: TrainingAttributeDto[];
    targetAudiences?: TrainingAttributeDto[];
    tags?: TrainingAttributeDto[];
    
    // 🔥 EKLENEN: Yorumlar Listesi
    trainingReviews?: TrainingReviewDto[];
}

export interface TrainingSectionDto {
    trainingSectionId: number;
    trainingSectionTitle: string;
    trainingSectionRowNumber: number;
    trainingContents?: TrainingContentDto[];
}

export interface TrainingContentDto {
    id: number;
    title: string;
    time?: string;
    orderId?: number;
    isLocked?: boolean;
    isChecked?: boolean;
    isActiveContent?: boolean;
    contentType?: { title: string }; // Basit tip tanımı
    trainingContentLibraryDto?: {
        trainingContentLibraryFilePath?: string;
        trainingContentLibraryFileName?: string;
        trainingContentLibraryVideoDuration?: string;
    };
    // Düzeltilmiş path
    filePath?: string; 
}

export interface ActiveContentResumeDto {
    contentId: number;
    sectionId: number;
    lastWatchedSecond: number;
    isCompleted: boolean;
}

export interface TrainingAttributeDto {
    id: number;
    value: string;
    order: number;
}

// 🔥 EKLENEN: Yorum Modeli
export interface TrainingReviewDto {
    rating: number;
    comment: string;
    createdDate: Date;
    user?: {
        name: string;
        surName?: string;
        profileImagePath?: string;
    };
}