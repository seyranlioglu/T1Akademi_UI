export interface MenuItemDto {
    title: string;
    path: string;
    icon: string;
    children?: MenuItemDto[];
    expanded?: boolean; // UI için
}

// 🔥 EKSİK OLAN USER MODELİNİ BURAYA EKLİYORUZ
export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber?: string;
    profileImagePath?: string; // Profil resmi için
    roles?: string[];
}

export interface UserMenuBody {
    isInstructor: boolean;
    menuItems: MenuItemDto[];
}

export interface UserMenuResponse {
    header: {
        result: boolean;
        msg: string | null;
        resCode: number;
        dt: string;
    };
    body: UserMenuBody;
}