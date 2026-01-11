export interface TrainingCategory {
    id: number;
    code: string;
    title: string;
    description: string;
    masterCategoryId?: number;
    isActive: boolean;
    subCategories?: TrainingCategory[]; 
}

// BU KISMI DEĞİŞTİRİYORUZ:
export interface ApiResponse<T> {
    header: {
        msgId: string;
        result: boolean;
        msg: string | null;
        resCode: number;
        dt: string;
    };
    body: T; // <-- Backend veriyi 'body' içine koymuş, biz de buraya 'body' diyoruz.
}