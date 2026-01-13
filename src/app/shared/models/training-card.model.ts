export interface TrainingCard {
  id: number;
  title: string;
  headerImage: string;
  categoryTitle: string;
  instructorTitle: string;
  instructorPicturePath?: string;
  amount: number;
  currentAmount: number;
  discountRate: number;
  trainingLevelTitle: string;
  rating: number;
  reviewCount: number;
  totalDurationMinutes: number;
  createdDate: Date;
}