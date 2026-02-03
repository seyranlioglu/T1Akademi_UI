export interface GetTraining {
    id: number;
    headerImage: string;
    langCode: string;

    // Kategori
    categoryId?: number;
    categoryCode?: string;
    categoryTitle?: string;

    // Temel Bilgiler
    title: string;
    description: string;
    priceTierId?: number;
    
    // ... (Diğer detay alanlar, ihtiyaca göre eklersin) ...

    // 🔥 DÜZENLENEBİLİR LİSTELER (Attribute Yapısı)
    // Backend'de TrainingAttributeDto olarak tanımladığımız yapı
    whatYouWillLearns: TrainingAttributeDto[];
    requirements: TrainingAttributeDto[];
    targetAudiences: TrainingAttributeDto[];
    tags: TrainingAttributeDto[];
}

// Ortak Attribute Modeli (Id, Value, Order)
export interface TrainingAttributeDto {
    id: number;     // DB ID'si (Varsa update, yoksa 0)
    value: string;  // Metin
    order: number;  // Sıralama
}