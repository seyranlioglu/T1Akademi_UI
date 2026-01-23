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
}

export interface SearchTrainingRequest {
    searchText?: string;
    pageIndex: number;
    pageSize: number;
    
    categoryIds?: number[];
    levelIds?: number[];
    languageIds?: number[];
    instructorIds?: number[]; // Bunu da ekleyelim (Opsiyonel backend desteklerse)
    minRating?: number;
    
    onlyPrivate: boolean;
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