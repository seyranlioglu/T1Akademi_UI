export interface TrainingCard {
  id: number;
  title: string;
  headerImage: string;
  
  // Kategori
  categoryTitle: string;
  categoryId?: number;       // EKLENDİ
  parentCategoryId?: number; // EKLENDİ

  instructorTitle: string;
  instructorPicturePath?: string;
  
  amount: number;
  currentAmount: number;
  discountRate: number;
  
  trainingLevelTitle: string;
  
  // Meta
  rating: number;
  reviewCount: number;
  totalDurationMinutes: number;
  createdDate: Date;
}