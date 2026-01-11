export interface UserMenuDto {
    title: string;
    path: string;
    icon: string;
    children?: UserMenuDto[];
isOpen?: boolean;
}

export interface UserMenuResponseDto {
    isInstructor: boolean;
    menuItems: UserMenuDto[];
}