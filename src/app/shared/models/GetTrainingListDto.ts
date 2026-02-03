export interface GetTrainingListDto {
    id: number;
    title: string;
    image: string | null;
    categoryName: string;
    isActive: boolean;
    statusName: string; // JSON'da 'statusName' geliyor
    createdDate: Date;
    completionRate: number;
}