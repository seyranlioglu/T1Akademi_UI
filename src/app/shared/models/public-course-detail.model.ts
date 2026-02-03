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

    // 🔥 GÜNCELLENEN & YENİ ALANLAR (String Listeleri)
    whatYouWillLearn: string[]; // Eskiden obje listesiydi, şimdi string[]
    requirements: string[];     // Yeni
    targetAudience: string[];   // Yeni
    tags: string[];             // Yeni

    // İlişkisel Veriler
    sections: PublicSection[];
    topReviews: PublicReview[];
}

export interface PublicSection {
    id: number;
    title: string;
    orderId: number;
    contents: PublicContent[];
}

export interface PublicContent {
    id: number;
    title: string;
    isPreview: boolean;
    durationMinutes: number; // Video süresi
    pageCount: number;
    type: string;
    filePath: string | null; // EKLENDİ: Video yolu için gerekli
}

export interface PublicReview {
    userName: string;
    userImage: string;
    rating: number;
    comment: string;
    date: Date;
}