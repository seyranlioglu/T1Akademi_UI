export interface ExamLibraryDto {
    examId: number;
    title: string;
    description: string;
    createdDate: Date;
    status: string;           // Backend: "Yayında" veya "Taslak" string dönüyor
    
    // İçerik İstatistikleri
    topicCount: number;
    questionCount: number;
    
    // Kullanım İstatistikleri
    isUsedInTraining: boolean;
    trainingCount: number;
    
    // 🔥 EKSİK OLANLAR BURADA EŞLEŞİYOR
    studentCount: number;     // Backend: StudentCount -> JSON: studentCount
    successRate: number;      // Backend: SuccessRate -> JSON: successRate
}