export interface DashboardStats {
    completedTrainingsCount: number;
    inProgressTrainingsCount: number;
    totalCertificates: number;
}

export interface ContinueTraining {
    trainingId: number;
    title: string;
    imageUrl: string; // Backend'den gelen HeaderImage buraya map edilebilir veya helper metodla yönetilir
    progress: number;
    lastLessonName: string;
    categoryId: number; // YENİ: Routing için gerekli
}

// Backend'deki TrainingCardDto ve TrainingViewCardDto ile uyumlu hale getirildi
export interface TrainingCard {
    id: number;
    title: string;
    description?: string;
    
    // Backend "HeaderImage" gönderiyor. Eğer mapping yapmazsak bu isimle karşılamalıyız.
    // Ama senin kodunda imageUrl yaygınsa, serviste maplemek gerekir. 
    // Şimdilik standart olması için headerImage ekliyorum.
    headerImage: string; 
    
    // Alternatif (Eski kodlar bozulmasın diye tutabilirsin ama backend'den veri gelmez)
    imageUrl?: string; 

    // Kategori & Eğitmen
    categoryId: number;
    parentCategoryId: number;
    categoryTitle: string;
    instructorName: string;
    instructorPicturePath?: string;

    // Meta Veriler
    rating?: number;
    reviewCount: number;
    totalDurationMinutes: number;
    lessonCount: number;
    trainingLevelTitle?: string;

    // Fiyat
    amount?: number;
    currentAmount?: number;
    discountRate?: number;

    // Durumlar & Rozetler
    isAssigned: boolean;
    isFavorite: boolean;
    isBestseller: boolean;
    isNew: boolean;
    
    // Takvim ve Durum
    accessStatus?: string; // 'Active', 'NotStarted', 'Expired'
    startDate?: Date;
    dueDate?: Date;
    assignDate?: Date;
    isCompleted?: boolean;
    progress: number;
    createdDate: string;

    // Hover Popover
    whatYouWillLearn: string[];
}

export interface UserCertificateDto {
    certificateId: string;
    templateTitle: string;
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