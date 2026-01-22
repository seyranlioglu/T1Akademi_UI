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
    lessonCount: number;
    totalMinutes: number;
    
    createdDate: Date;
    isPrivate: boolean;
    isActive: boolean;
}

export interface SearchTrainingRequest {
    searchText?: string;
    pageIndex: number;
    pageSize: number;
    
    categoryIds?: number[];
    levelIds?: number[];
    languageIds?: number[];
    minRating?: number;
    
    onlyPrivate: boolean;
}

// PagedList yapısı (Genel yapında yoksa)
export interface PagedList<T> {
    items: T[];
    pageIndex: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}