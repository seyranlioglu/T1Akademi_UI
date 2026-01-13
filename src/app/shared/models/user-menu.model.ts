export interface MenuItemDto {
    title: string;
    path: string;
    icon: string;
    children?: MenuItemDto[];
    expanded?: boolean; // UI için
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