import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PlayerLayoutComponent } from './layouts/player-layout/player-layout.component';

// Guards
import { AuthGuard } from './shared/guards/auth.guard';
import { IdValidatorGuard } from './shared/guards/id-validator.guard';
import { InstructorGuard } from './shared/guards/instructor.guard';

// Components (Auth & Common)
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { RegisterPageComponent } from './components/pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './components/pages/reset-password-page/reset-password-page.component';
import { VerifyComponent } from './components/pages/verify/verify.component';
import { ForgotPasswordPageComponent } from './components/pages/forgot-password-page/forgot-password-page.component';
import { AccountVerificationComponent } from './components/pages/login-page/account-verification/account-verification.component';

// Dashboard & Pages (Öğrenci)
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
import { CourseDetailsPageComponent } from './components/dashboard/course-details-page/course-details-page.component';
import { OverviewComponent } from './components/dashboard/overview/overview.component';
import { CompanyEmployeesComponent } from './components/dashboard/company-employees/company-employees.component';

// Public Pages
import { HomeDemoOneComponent } from './components/pages/home-demo-one/home-demo-one.component';
import { HomeDemoTwoComponent } from './components/pages/home-demo-two/home-demo-two.component';
import { HomeDemoThreeComponent } from './components/pages/home-demo-three/home-demo-three.component';
import { AboutPageComponent } from './components/pages/about-page/about-page.component';
import { InstructorsPageComponent } from './components/pages/instructors-page/instructors-page.component';
import { InstructorProfilePageComponent } from './components/pages/instructor-profile-page/instructor-profile-page.component';
import { CoursesGridPageComponent } from './components/pages/courses-grid-page/courses-grid-page.component';
import { CoursesListPageComponent } from './components/pages/courses-list-page/courses-list-page.component';
import { CourseComponent } from './components/pages/course/course.component';
import { EventsPageComponent } from './components/pages/events-page/events-page.component';
import { EventDetailsPageComponent } from './components/pages/event-details-page/event-details-page.component';
import { SuccessStoriesPageComponent } from './components/pages/success-stories-page/success-stories-page.component';
import { BlogGridPageComponent } from './components/pages/blog-grid-page/blog-grid-page.component';
import { BlogRightSidebarPageComponent } from './components/pages/blog-right-sidebar-page/blog-right-sidebar-page.component';
import { BlogDetailsPageComponent } from './components/pages/blog-details-page/blog-details-page.component';
import { ContactPageComponent } from './components/pages/contact-page/contact-page.component';
import { PricingPageComponent } from './components/pages/pricing-page/pricing-page.component';
import { FaqPageComponent } from './components/pages/faq-page/faq-page.component';
import { PrivacyPolicyPageComponent } from './components/pages/privacy-policy-page/privacy-policy-page.component';
import { TermsConditionsPageComponent } from './components/pages/terms-conditions-page/terms-conditions-page.component';
import { TestimonialsPageComponent } from './components/pages/testimonials-page/testimonials-page.component';

// Instructor Components (Eğitmen)
import { InstructorComponent } from './components/pages/instructor/instructor.component';
import { CoursesComponent } from './components/pages/instructor/courses/courses.component';
import { CourseManageComponent } from './components/pages/instructor/course-manage/course-manage.component';
import { CurriculumComponent } from './components/pages/instructor/course-manage/curriculum/curriculum.component';
import { WhatYouWillLearnComponent } from './components/pages/instructor/course-manage/what-you-will-learn/what-you-will-learn.component';
import { CourseLandingComponent } from './components/pages/instructor/course-manage/course-landing/course-landing.component';
import { CoursePricingComponent } from './components/pages/instructor/course-manage/course-pricing/course-pricing.component';
import { ExamLibraryComponent } from './components/pages/instructor/course-manage/curriculum/exam-library/exam-library.component';
import { ExamEditorComponent } from './components/pages/instructor/course-manage/curriculum/exam-editor/exam-editor.component';
import { PerformanceComponent } from './components/pages/instructor/performance/performance.component';
import { LibraryComponent } from './components/pages/instructor/library/library.component'; // YENİ

const routes: Routes = [

        // 1. AUTH - TAMAMEN BAĞIMSIZ (Navbar/Sidebar YOK)
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginPageComponent },
            { path: 'register', component: RegisterPageComponent },
            { path: 'forgot-password', component: ForgotPasswordPageComponent },
            { path: 'reset-password', component: ResetPasswordPageComponent },
            { path: 'account-verification', component: AccountVerificationComponent },
            { path: 'verify', component: VerifyComponent },
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
    // =================================================================
    // 1. ANA PLATFORM (Öğrenci Arayüzü - Navbar & Footer Var)
    // =================================================================
    {
        path: '',
        component: MainLayoutComponent, // Bu layout içinde Navbar ve Footer var
        children: [
            // Public Sayfalar
            { path: '', component: OverviewComponent },
            { path: 'about', component: AboutPageComponent },
            { path: 'instructors', component: InstructorsPageComponent },
            { path: 'instructor-profile', component: InstructorProfilePageComponent },
            { path: 'courses-grid', component: CoursesGridPageComponent },
            { path: 'courses-list', component: CoursesListPageComponent },
            { path: 'course/:id', component: CourseComponent },
            { path: 'events', component: EventsPageComponent },
            { path: 'event-details', component: EventDetailsPageComponent },
            { path: 'success-stories', component: SuccessStoriesPageComponent },
            { path: 'blog-grid', component: BlogGridPageComponent },
            { path: 'blog-right-sidebar', component: BlogRightSidebarPageComponent },
            { path: 'blog-details', component: BlogDetailsPageComponent },
            { path: 'contact', component: ContactPageComponent },
            { path: 'pricing', component: PricingPageComponent },
            { path: 'faq', component: FaqPageComponent },
            { path: 'testimonials', component: TestimonialsPageComponent },
            { path: 'privacy-policy', component: PrivacyPolicyPageComponent },
            { path: 'terms-conditions', component: TermsConditionsPageComponent },
            


            // Öğrenci Paneli (Dashboard) - AuthGuard Korumalı
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: OverviewComponent },
                    { path: 'my-profile', component: MyProfileComponent },
                    { path: 'edit-profile', component: EditProfileComponent },
                    { path: 'reviews', component: ReviewsComponent },
                    { path: 'enrolled-courses', component: EnrolledCoursesComponent },
                    { path: 'wishlist', component: WishlistComponent },
                    { path: 'active-courses', component: ActiveCoursesComponent },
                    { path: 'completed-courses', component: CompletedCoursesComponent },
                    { path: 'orders-list', component: OrdersListComponent },
                    { path: 'company-employees', component: CompanyEmployeesComponent },
                    { path: 'cart', component: CartComponent },
                ]
            }
        ]
    },

    // =================================================================
    // 2. EĞİTMEN PANELİ (Instructor Studio - BAĞIMSIZ LAYOUT) 
    // =================================================================
    // Burası MainLayoutComponent'in DIŞINDA. Kendi Navbar/Sidebar'ı var.
    {
        path: 'instructor',
        component: InstructorComponent, // <--- Kendi layout'unu (sidebar vb.) yönetir
        canActivate: [InstructorGuard],
        children: [
            // Panele girince varsayılan olarak Kurslar açılsın
            { path: '', redirectTo: 'courses', pathMatch: 'full' }, 
            
            { path: 'performance', component: PerformanceComponent },
            { path: 'courses', component: CoursesComponent },
            
            // YENİ: Kütüphane
            { path: 'library', component: LibraryComponent }, 

            // Kurs Yönetim Alt Rotaları
            {
                path: 'course-manage/:id',
                component: CourseManageComponent,
                canActivate: [IdValidatorGuard],
                children: [
                    { path: '', redirectTo: 'what-you-will-learn', pathMatch: 'full' },
                    { path: 'what-you-will-learn', component: WhatYouWillLearnComponent },
                    { path: 'curriculum', component: CurriculumComponent },
                    { path: 'course-landing', component: CourseLandingComponent },
                    { path: 'course-pricing', component: CoursePricingComponent },
                    { path: 'exam-library', component: ExamLibraryComponent },
                    { path: 'exam-editor/:examId', component: ExamEditorComponent }
                ]
            }
        ]
    },

    // =================================================================
    // 3. PLAYER (Ders İzleme Ekranı - BAĞIMSIZ LAYOUT)
    // =================================================================
    {
        path: 'course-player/:id',
        component: PlayerLayoutComponent,
        canActivate: [AuthGuard, IdValidatorGuard],
        children: [
            { path: '', component: CourseDetailsPageComponent }
        ]
    },

    // 404
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }