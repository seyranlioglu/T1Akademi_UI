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
    sections: CourseSection[];
    whatYouWillLearn: any[]; // Detay veri yapısı varsa tip eklenebilir
    topReviews: any[];
}

export interface CourseSection {
    title: string;
    contents: CourseContent[];
}

export interface CourseContent {
    title: string;
    duration: string;
    isFree?: boolean; // Önizleme için gerekebilir
}