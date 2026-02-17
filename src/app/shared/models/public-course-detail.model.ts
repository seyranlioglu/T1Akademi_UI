export interface PublicReview {
    userName: string;
    userImage: string;
    rating: number;
    comment: string;
    date: Date;
}

export interface PublicContent {
    id: number;
    title: string;
    isPreview: boolean;
    durationMinutes: number;
    pageCount: number;
    type: string; // 'video', 'pdf', 'image', 'exam'
    filePath: string | null;
}

export interface PublicSection {
    id: number;
    title: string;
    orderId: number;
    contents: PublicContent[];
}

export interface PublicCourseDetail {
    id: number;
    title: string;
    description: string;
    headerImage: string;
    previewVideoPath?: string;
    language: string;
    categoryName: string;
    levelName: string;
    
    // İstatistikler
    rating: number;
    reviewCount: number;
    studentCount: number;
    lastUpdateDate: Date;

    // 🔥 EKLENEN EKSİK ALANLAR (Hata Sebebi Bunlardı)
    totalResourceCount: number; 
    videoLength: number;
    accessPeriod: string;
    certificateAvailable: boolean;

    // Yeni Metrikler
    tqs: number;       
    isPremium: boolean; 

    // Fiyat
    amount: number;
    currentAmount: number;
    discountRate: number;
    priceTierId?: number;

    // Eğitmen
    instructorId: number;
    instructorName: string;
    instructorTitle: string;
    instructorImage: string;
    instructorBio: string;
    instructorRating: number;
    instructorTotalStudents: number;
    instructorTotalCourses: number;

    // Listeler
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
    tags: string[];

    // İlişkisel Veriler
    sections: PublicSection[];
    topReviews: PublicReview[];
}