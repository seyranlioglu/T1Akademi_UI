import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PlayerLayoutComponent } from './layouts/player-layout/player-layout.component';

// Guards
import { AuthGuard } from './shared/guards/auth.guard';
import { IdValidatorGuard } from './shared/guards/id-validator.guard';
import { InstructorGuard } from './shared/guards/instructor.guard';

// Components
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { RegisterPageComponent } from './components/pages/register-page/register-page.component';
import { ForgotPasswordPageComponent } from './components/pages/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './components/pages/reset-password-page/reset-password-page.component';
import { VerifyComponent } from './components/pages/verify/verify.component';

// Dashboard & Pages
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EnrolledCoursesComponent } from './components/dashboard/enrolled-courses/enrolled-courses.component';
import { WishlistComponent } from './components/dashboard/wishlist/wishlist.component';
import { MyProfileComponent } from './components/dashboard/my-profile/my-profile.component';
import { EditProfileComponent } from './components/dashboard/edit-profile/edit-profile.component';
import { ActiveCoursesComponent } from './components/dashboard/active-courses/active-courses.component';
import { OrdersListComponent } from './components/dashboard/orders-list/orders-list.component';
import { ReviewsComponent } from './components/dashboard/reviews/reviews.component';
import { CompletedCoursesComponent } from './components/dashboard/completed-courses/completed-courses.component';
import { CartComponent } from './components/dashboard/cart/cart.component';
import { CourseDetailsPageComponent } from './components/pages/course-details-page/course-details-page.component';
import { CourseComponent } from './components/pages/course/course.component';

// Instructor
import { InstructorComponent } from './components/pages/instructor/instructor.component';
import { CoursesComponent } from './components/pages/instructor/courses/courses.component';
import { CourseManageComponent } from './components/pages/instructor/course-manage/course-manage.component';
import { CurriculumComponent } from './components/pages/instructor/course-manage/curriculum/curriculum.component';
import { WhatYouWillLearnComponent } from './components/pages/instructor/course-manage/what-you-will-learn/what-you-will-learn.component';
import { CourseLandingComponent } from './components/pages/instructor/course-manage/course-landing/course-landing.component';
import { CoursePricingComponent } from './components/pages/instructor/course-manage/course-pricing/course-pricing.component';
import { OverviewComponent } from './components/dashboard/overview/overview.component';

const routes: Routes = [

    // 1. AUTH - TAMAMEN BAĞIMSIZ (Navbar/Sidebar YOK)
    {
        path: 'auth',
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginPageComponent },
            { path: 'register', component: RegisterPageComponent },
            { path: 'forgot-password', component: ForgotPasswordPageComponent },
            { path: 'reset-password', component: ResetPasswordPageComponent },
            { path: 'verify', component: VerifyComponent }
        ]
    },

    // 2. PLAYER (BAĞIMSIZ - NAVBAR/SIDEBAR YOK)
    {
        path: 'course/:id/watch',
        component: PlayerLayoutComponent,
        canActivate: [AuthGuard, IdValidatorGuard],
        children: [
            { path: '', component: CourseComponent }
        ]
    },

    // 3. EĞİTİM YÖNETİMİ (BAĞIMSIZ - ÖZEL MENÜSÜ VAR)
    // MainLayout dışında tanımlandığı için senin ana sidebar'ını görmez.
    {
        path: 'instructor/course-manage/:id',
        component: CourseManageComponent,
        canActivate: [AuthGuard, InstructorGuard, IdValidatorGuard],
        children: [
            { path: '', redirectTo: 'curriculum', pathMatch: 'full' },
            { path: 'curriculum', component: CurriculumComponent },
            { path: 'what-you-will-learn', component: WhatYouWillLearnComponent },
            { path: 'course-landing', component: CourseLandingComponent },
            { path: 'course-pricing', component: CoursePricingComponent },
        ]
    },

    // 4. ANA PLATFORM (NAVBAR VE SİDEBAR VAR)
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            
            // Dashboard Alanı
                {
                    path: 'dashboard',
                    component: DashboardComponent,
                    children: [
                        { path: '', redirectTo: 'overview', pathMatch: 'full' },
                        { path: 'overview', component: OverviewComponent }, // Overview'ı buraya ekledik
                        { path: 'active-courses', component: ActiveCoursesComponent },
                        { path: 'enrolled-courses', component: EnrolledCoursesComponent },
                        { path: 'wishlist', component: WishlistComponent },
                        { path: 'my-profile', component: MyProfileComponent },
                        { path: 'edit-profile', component: EditProfileComponent },
                        { path: 'orders-list', component: OrdersListComponent },
                        { path: 'reviews', component: ReviewsComponent },
                        { path: 'completed-courses', component: CompletedCoursesComponent },
                        { path: 'cart', component: CartComponent },
                    ]
                },

            // Kurs Listeleme ve Detay (Menüde var olanlar)
            { path: 'courses', component: CourseDetailsPageComponent }, // Katalog sayfası bileşeniyle değişebilir
            { path: 'course/:id', component: CourseDetailsPageComponent, canActivate: [IdValidatorGuard] },

            // Kurumsal Panel Linkleri (Backend'den gelen linklerin Sidebar içinde çalışması için)
            { path: 'company/employees', component: ActiveCoursesComponent }, // İlgili personeller bileşeniyle değiştirilecek
            { path: 'company/assign', component: ActiveCoursesComponent },    // İlgili atama bileşeniyle değiştirilecek
            { path: 'company/reports', component: ActiveCoursesComponent },   // İlgili rapor bileşeniyle değiştirilecek
            { path: 'company/requests', component: ActiveCoursesComponent },

            // Eğitmen Listesi
            { path: 'instructor/courses', component: CoursesComponent, canActivate: [InstructorGuard] },
            { path: 'instructor/dashboard', component: CoursesComponent },

            // 404 Sayfası Layout İçinde kalsın
            { path: '404', component: NotFoundComponent },
        ]
    },

    // Herhangi bir hata durumunda 404'e at
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }