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

    amount: number;
    currentAmount: number;
    discountRate: number;

    levelName: string;
    rating: number;
    reviewCount: number;
    totalMinutes: number;
    lessonCount: number;
    
    // Backend'den string listesi geliyor
    whatYouWillLearn: string[]; 

    createdDate: Date;
    
    // UI Rozetleri
    isPrivate: boolean;
    isActive: boolean;
    isNew: boolean;
    isBestseller: boolean;
    
    // Kullanıcı Durumu
    isFavorite: boolean;
    isAssigned: boolean;

    // 🔥 EKLENEN EKSİK ALANLAR (Hataları Çözen Kısım)
    priceTierId?: number;     
    categoryId?: number;
    parentCategoryId?: number;
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

export interface AddReviewDto {
    trainingId: number;
    rating: number;
    comment: string;
}