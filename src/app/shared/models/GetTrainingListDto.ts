export interface GetTrainingListDto {
    id: number;
    title: string;
    subTitle: string;        // Backend: SubTitle
    description: string;
    image: string | null;
    categoryName: string;
    isActive: boolean;
    statusName: string; // JSON'da 'statusName' geliyor
    createdDate: Date;
    completionRate: number;
}