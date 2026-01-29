export interface GetTrainingListDto {
    id: number;
    title: string;
    image: string;
    categoryName: string;
    isActive: boolean;
    statusName: string; // 'Taslak', 'Yayında' vb.
    createdDate: string; // Date string gelir
    completionRate: number; // 0-100 arası
}