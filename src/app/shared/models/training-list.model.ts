export interface FilterItem {
    id: number;
    title: string;
    parentId?: number;
}

export interface FilterOptionsResponse {
    categories: FilterItem[];
    levels: FilterItem[];
    languages: FilterItem[];
    instructors: FilterItem[];
}

export interface CategoryTreeNode extends FilterItem {
    level: number;      // Girinti seviyesi (0, 1, 2...)
    isVisible: boolean; // Arama sonucunda görünüp görünmeyeceği
    children?: CategoryTreeNode[]; // İleride gerekirse diye, şimdilik düz liste mantığıyla çözeceğiz
}

export interface TrainingListItem {
    id: number;
    title: string;
    description: string;
    headerImage: string;
    categoryName: string;
    instructorName: string;
    instructorImage: string;
    levelName: string;
    amount: number;
    currentAmount: number;
    discountRate: number;
    rating: number;
    reviewCount: number;
    lessonCount: number;
    totalMinutes: number;
    createdDate: Date;
    isPrivate: boolean;
    isActive: boolean;
    categoryId?: number;
    parentCategoryId?: number;
    priceTierId: number;

    // --- EKLENEN YENİ ALANLAR (UI ve Logic İçin) ---
    whatYouWillLearn?: string[]; // Hoverda çıkacak liste
    isBestseller?: boolean;      // Rozet
    isNew?: boolean;             // Rozet
    isFavorite?: boolean;        // Kalp durumu
    isAssigned?: boolean;        // Satın alındı mı?
}

export interface SearchTrainingRequest {
    searchText?: string;
    pageIndex: number;
    pageSize: number;
    
    categoryIds?: number[];
    levelIds?: number[];
    languageIds?: number[];
    instructorIds?: number[]; 
    minRating?: number;
    
    onlyPrivate: boolean;
    sortBy?: string;
}

export interface PagedList<T> {
    items: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Yorum Ekleme Modeli (Yeni)
export interface AddReviewDto {
    trainingId: number;
    rating: number;
    comment: string;
}