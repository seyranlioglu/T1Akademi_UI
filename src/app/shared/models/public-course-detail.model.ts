export interface PublicCourseDetail {
    id: number;
    title: string;
    description: string | null;
    headerImage: string | null;
    previewVideoPath: string | null;
    language: string | null;
    categoryName: string | null;
    levelName: string | null;
    rating: number;
    reviewCount: number;
    studentCount: number;
    lastUpdateDate: string;
    amount: number;
    currentAmount: number;
    discountRate: number;
    priceTierId: number | null;
    instructorId: number;
    instructorName: string;
    instructorTitle: string | null;
    instructorImage: string | null;
    instructorBio: string | null;
    instructorRating: number;
    instructorTotalStudents: number;
    instructorTotalCourses: number;
    
    // İlişkisel Veriler
    sections: PublicSectionDto[];
    whatYouWillLearn: string[];
    topReviews: PublicReviewDto[];
}

export interface PublicSectionDto {
    id: number;
    title: string;
    orderId: number;
    contents: PublicContentDto[];
}

// 🔥 DÜZELTİLEN KISIM: 'CourseContent' yerine 'PublicContentDto' ve 'durationMinutes' eklendi
export interface PublicContentDto {
    id: number;
    title: string;
    isPreview: boolean;
    durationMinutes: number; // HTML'de kullanılan alan burası
    type: string;
}

export interface PublicReviewDto {
    userName: string;
    userImage: string;
    rating: number;
    comment: string;
    date: string;
}