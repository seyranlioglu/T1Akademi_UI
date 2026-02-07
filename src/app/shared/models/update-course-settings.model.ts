export interface UpdateCourseSettingsDto {
    id: number;
    welcomeMessage?: string;
    congratulationMessage?: string;
    certificateOfAchievementRate: number;
    certificateOfParticipationRate?: number;
    isPrivate: boolean;
}