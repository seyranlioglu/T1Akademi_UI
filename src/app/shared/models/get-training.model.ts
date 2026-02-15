export interface GetTraining {
    id: number;
    title: string;
    subTitle?: string;
    description?: string;
    headerImage?: string;
    trailer?: string;
    langCode?: string;
    
    // 🔥 EKLENEN: Admin Paneli ve Ban İşlemleri için
    instructorId?: number; 
    qualityScore?: number;

    // İstatistikler
    totalLectureCount?: number;
    totalDurationMinutes?: number;
    rating?: number;
    reviewCount?: number;
    studentCount?: number;
    progressPercentage?: number;

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

    // Listeler ve İlişkiler
    resumeContext?: ActiveContentResumeDto;
    trainingSections: TrainingSectionDto[];
    
    // Alt Bilgiler
    whatYouWillLearns?: TrainingAttributeDto[];
    requirements?: TrainingAttributeDto[];
    targetAudiences?: TrainingAttributeDto[];
    tags?: TrainingAttributeDto[];
    
    // Yorumlar
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
    
    // 🔥 EKLENEN: Taslak Kontrolü ve Sınav
    isActive?: boolean; 
    examId?: number;

    contentType?: { 
        code?: string;
        title: string; 
    }; 
    
    trainingContentLibraryDto?: {
        trainingContentLibraryFilePath?: string;
        trainingContentLibraryFileName?: string;
        trainingContentLibraryVideoDuration?: string;
    };
    
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
    // 🔥 Opsiyonel yaptık ki diğer componentler hata vermesin
    trainingId?: number; 
    attributeType?: number;
}

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

// 🔥 EKLENEN: Kalite Puanı Detay Modeli
export interface TrainingQualityScoreDto {
    trainingId: number;
    totalScore: number;
    lastCalculatedDate: Date;
    suggestions: string[]; 
    scoreDetails: { [key: string]: number }; 
}