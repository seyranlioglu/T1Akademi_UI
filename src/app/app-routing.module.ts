import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { HomeDemoOneComponent } from './components/pages/home-demo-one/home-demo-one.component';
import { HomeDemoTwoComponent } from './components/pages/home-demo-two/home-demo-two.component';
import { HomeDemoThreeComponent } from './components/pages/home-demo-three/home-demo-three.component';
import { ContactPageComponent } from './components/pages/contact-page/contact-page.component';
import { AboutPageComponent } from './components/pages/about-page/about-page.component';
import { FaqPageComponent } from './components/pages/faq-page/faq-page.component';
import { PrivacyPolicyPageComponent } from './components/pages/privacy-policy-page/privacy-policy-page.component';
import { TermsConditionsPageComponent } from './components/pages/terms-conditions-page/terms-conditions-page.component';
import { RegisterPageComponent } from './components/pages/register-page/register-page.component';
import { TestimonialsPageComponent } from './components/pages/testimonials-page/testimonials-page.component';
import { ForgotPasswordPageComponent } from './components/pages/forgot-password-page/forgot-password-page.component';
import { InstructorsPageComponent } from './components/pages/instructors-page/instructors-page.component';
import { InstructorProfilePageComponent } from './components/pages/instructor-profile-page/instructor-profile-page.component';
import { SuccessStoriesPageComponent } from './components/pages/success-stories-page/success-stories-page.component';
import { PricingPageComponent } from './components/pages/pricing-page/pricing-page.component';
import { EventsPageComponent } from './components/pages/events-page/events-page.component';
import { EventDetailsPageComponent } from './components/pages/event-details-page/event-details-page.component';
import { BlogGridPageComponent } from './components/pages/blog-grid-page/blog-grid-page.component';
import { BlogRightSidebarPageComponent } from './components/pages/blog-right-sidebar-page/blog-right-sidebar-page.component';
import { BlogDetailsPageComponent } from './components/pages/blog-details-page/blog-details-page.component';
import { CourseDetailsPageComponent } from './components/pages/course-details-page/course-details-page.component';
import { CoursesGridPageComponent } from './components/pages/courses-grid-page/courses-grid-page.component';
import { CoursesListPageComponent } from './components/pages/courses-list-page/courses-list-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EnrolledCoursesComponent } from './components/dashboard/enrolled-courses/enrolled-courses.component';
import { WishlistComponent } from './components/dashboard/wishlist/wishlist.component';
import { MyProfileComponent } from './components/dashboard/my-profile/my-profile.component';
import { ActiveCoursesComponent } from './components/dashboard/active-courses/active-courses.component';
import { OrdersListComponent } from './components/dashboard/orders-list/orders-list.component';
import { ReviewsComponent } from './components/dashboard/reviews/reviews.component';
import { CompletedCoursesComponent } from './components/dashboard/completed-courses/completed-courses.component';
import { CartComponent } from './components/dashboard/cart/cart.component';
import { EditProfileComponent } from './components/dashboard/edit-profile/edit-profile.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { CourseManageComponent } from './components/pages/instructor/course-manage/course-manage.component';
import { CurriculumComponent } from './components/pages/instructor/course-manage/curriculum/curriculum.component';
import { InstructorComponent } from './components/pages/instructor/instructor.component';
import { PerformanceComponent } from './components/pages/instructor/performance/performance.component';
import { CoursesComponent } from './components/pages/instructor/courses/courses.component';
import { VerifyComponent } from './components/pages/verify/verify.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { IdValidatorGuard } from './shared/guards/id-validator.guard';
import { CourseComponent } from './components/pages/course/course.component';
import { WhatYouWillLearnComponent } from './components/pages/instructor/course-manage/what-you-will-learn/what-you-will-learn.component';
import { CourseLandingComponent } from './components/pages/instructor/course-manage/course-landing/course-landing.component';
import { CoursePricingComponent } from './components/pages/instructor/course-manage/course-pricing/course-pricing.component';
import { ResetPasswordPageComponent } from './components/pages/reset-password-page/reset-password-page.component';
import { InstructorGuard } from './shared/guards/instructor.guard';

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            // { path: '', component: HomeDemoOneComponent },
            // { path: 'index-2', component: HomeDemoTwoComponent },
            // { path: 'index-3', component: HomeDemoThreeComponent },
            // { path: 'about', component: AboutPageComponent },
            // { path: 'instructors', component: InstructorsPageComponent },
            // {
            //     path: 'instructor-profile',
            //     component: InstructorProfilePageComponent,
            // },
            // { path: 'success-stories', component: SuccessStoriesPageComponent },
            // { path: 'pricing', component: PricingPageComponent },
            // { path: 'faq', component: FaqPageComponent },
            // { path: 'courses-grid', component: CoursesGridPageComponent },
            // { path: 'courses-list', component: CoursesListPageComponent },

            // { path: 'events', component: EventsPageComponent },
            // { path: 'event-details', component: EventDetailsPageComponent },
            // { path: 'testimonials', component: TestimonialsPageComponent },
            // { path: 'privacy-policy', component: PrivacyPolicyPageComponent },
            // {
            //     path: 'terms-conditions',
            //     component: TermsConditionsPageComponent,
            // },
            // { path: 'blog-grid', component: BlogGridPageComponent },
            // {
            //     path: 'blog-right-sidebar',
            //     component: BlogRightSidebarPageComponent,
            // },
            // { path: 'blog-details', component: BlogDetailsPageComponent },
            // { path: 'contact', component: ContactPageComponent },
            // {
            //     path: 'course-details/:id',
            //     data: {
            //         courseManageIdPattern: /^[0-9]+$/,
            //         toolbar: false,

            //     },
            //     canActivate: [IdValidatorGuard],
            //     component: CourseDetailsPageComponent
            // },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full', },
            {
                path: 'dashboard',
                component: DashboardComponent,
                children: [
                    {
                        path: 'enrolled-courses',
                        component: EnrolledCoursesComponent,
                    },
                    { path: 'wishlist', component: WishlistComponent },
                    { path: 'my-profile', component: MyProfileComponent },
                    { path: 'edit-profile', component: EditProfileComponent },
                    {
                        path: 'active-courses',
                        component: ActiveCoursesComponent,
                    },
                    { path: 'orders-list', component: OrdersListComponent },
                    { path: 'reviews', component: ReviewsComponent },
                    {
                        path: 'completed-courses',
                        component: CompletedCoursesComponent,
                    },
                    { path: 'cart', component: CartComponent },
                ],
            },
            {
                path: 'course/:id',
                data: { courseIdPattern: /^[0-9]+$/ },
                canActivate: [IdValidatorGuard],
                children: [
                    { path: '', redirectTo: 'details', pathMatch: 'full' },
                    { path: 'details', component: CourseDetailsPageComponent },
                    {
                        path: 'watch',
                        component: CourseComponent,
                        data: { toolbar: false },
                    },
                ],
            },
            { path: 'course', redirectTo: '/', pathMatch: 'full' },
            {
                path: 'instructor',
                canActivate: [InstructorGuard],
                component: InstructorComponent,
                children: [
                    { path: '', redirectTo: 'courses', pathMatch: 'full' },
                    {
                        path: 'courses',
                        data: { toolbar: false },
                        component: CoursesComponent,
                    },
                    {
                        path: 'course-manage',
                        data: { toolbar: false },
                        redirectTo: 'courses',
                        pathMatch: 'full',
                    },
                    {
                        path: 'course-manage/:id',
                        data: {
                            courseManageIdPattern: /^[0-9]+$/,
                            toolbar: false,
                        },
                        canActivate: [IdValidatorGuard],
                        component: CourseManageComponent,
                        children: [
                            {
                                path: '',
                                redirectTo: 'what-you-will-learn',
                                pathMatch: 'full',
                            },
                            {
                                path: 'curriculum',
                                data: { toolbar: false },
                                component: CurriculumComponent,
                            },
                            {
                                path: 'what-you-will-learn',
                                data: { toolbar: false },
                                component: WhatYouWillLearnComponent,
                            },
                            {
                                path: 'course-landing',
                                data: { toolbar: false },
                                component: CourseLandingComponent,
                            },
                            {
                                path: 'course-pricing',
                                data: { toolbar: false },
                                component: CoursePricingComponent,
                            },

                        ],
                    },
                    //{ path: 'performance', data: { toolbar: false }, component: PerformanceComponent },
                ],
            },
        ],
    },
    {
        path: 'auth',
        data: { toolbar: false },
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
                data: { returnUrl: window.location.pathname },
            },
            { path: 'verify', component: VerifyComponent },
            { path: 'login', component: LoginPageComponent },
            { path: 'register', component: RegisterPageComponent },
            { path: 'reset-password', component: ResetPasswordPageComponent },
            { path: 'forgot-password', component: ForgotPasswordPageComponent },
        ],
    },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
