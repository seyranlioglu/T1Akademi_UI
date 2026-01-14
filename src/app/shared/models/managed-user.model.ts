export interface ManagedUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;       // Null gelebilir (Eğitmen KVKK)
    phoneNumber: string | null; // Null gelebilir
    title: string | null;
    companyName: string | null;
    isActive: boolean;
    status: string;
    createdDate: string;
    viewMode: 'AdminView' | 'CompanyView' | 'InstructorView';
}