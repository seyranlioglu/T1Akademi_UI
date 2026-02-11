import { NgModule } from '@angular/core';
import { NgxScrollTopModule } from 'ngx-scrolltop';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeDemoOneComponent } from './components/pages/home-demo-one/home-demo-one.component';
import { HomeDemoTwoComponent } from './components/pages/home-demo-two/home-demo-two.component';
import { HomeDemoThreeComponent } from './components/pages/home-demo-three/home-demo-three.component';
import { NavbarComponent } from './components/common/navbar/navbar.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { BlogComponent } from './components/common/blog/blog.component';
import { PartnerComponent } from './components/common/partner/partner.component';
import { FeaturesComponent } from './components/common/features/features.component';
import { SubscribeComponent } from './components/common/subscribe/subscribe.component';
import { FeedbackComponent } from './components/common/feedback/feedback.component';
import { InstructorsComponent } from './components/common/instructors/instructors.component';
import { AboutComponent } from './components/common/about/about.component';
import { FeaturedComponent } from './components/common/featured/featured.component';
import { CategoriesComponent } from './components/common/categories/categories.component';
import { CoursesToledoComponent } from './components/common/courses/courses.component';
import { CoursesComponent } from './components/pages/instructor/courses/courses.component';
import { FeaturedCoursesComponent } from './components/common/featured-courses/featured-courses.component';
import { HomeoneBannerComponent } from './components/pages/home-demo-one/homeone-banner/homeone-banner.component';
import { TopRatedCoursesComponent } from './components/common/top-rated-courses/top-rated-courses.component';
import { FunfactsComponent } from './components/common/funfacts/funfacts.component';
import { FeaturedBoxesComponent } from './components/common/featured-boxes/featured-boxes.component';
import { HometwoBannerComponent } from './components/pages/home-demo-two/hometwo-banner/hometwo-banner.component';
import { TopHeaderComponent } from './components/common/top-header/top-header.component';
import { OverviewComponent } from './components/dashboard/overview/overview.component';
import { VideoComponent } from './components/common/video/video.component';
import { HomethreeBannerComponent } from './components/pages/home-demo-three/homethree-banner/homethree-banner.component';
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
import { BlogWidgetComponent } from './components/common/blog-widget/blog-widget.component';
import { CoursesGridPageComponent } from './components/pages/courses-grid-page/courses-grid-page.component';
import { CoursesListPageComponent } from './components/pages/courses-list-page/courses-list-page.component';
import { CourseDetailsPageComponent } from './components/dashboard/course-details-page/course-details-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EnrolledCoursesComponent } from './components/dashboard/enrolled-courses/enrolled-courses.component';
import { WishlistComponent } from './components/dashboard/wishlist/wishlist.component';
import { MyProfileComponent } from './components/dashboard/my-profile/my-profile.component';
import { ActiveCoursesComponent } from './components/dashboard/active-courses/active-courses.component';
import { ReviewsComponent } from './components/dashboard/reviews/reviews.component';
import { CompletedCoursesComponent } from './components/dashboard/completed-courses/completed-courses.component';
import { CartComponent } from './components/dashboard/cart/cart.component';
import { OrdersListComponent } from './components/dashboard/orders-list/orders-list.component';
import { EditProfileComponent } from './components/dashboard/edit-profile/edit-profile.component';
import { PlyrModule } from '@atom-platform/ngx-plyr';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { CourseManageComponent } from './components/pages/instructor/course-manage/course-manage.component';
import { CurriculumComponent } from './components/pages/instructor/course-manage/curriculum/curriculum.component';
import { InstructorComponent } from './components/pages/instructor/instructor.component';
import { VerifyComponent } from './components/pages/verify/verify.component';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewCourseFormComponent } from './components/pages/instructor/courses/new-course-form/new-course-form.component';
import { CourseContentComponent } from './components/pages/instructor/course-manage/curriculum/course-content/course-content.component';
import { DynamicDialogComponent } from './shared/components/dynamic-dialog.component';
import { CourseSectionComponent } from './components/pages/instructor/course-manage/curriculum/course-section/course-section.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { courseReducer } from './shared/store/course.reducer';
import { CourseEffects } from './shared/store/course.effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { WhatYouWillLearnComponent } from './components/pages/instructor/course-manage/what-you-will-learn/what-you-will-learn.component';
import { CourseLandingComponent } from './components/pages/instructor/course-manage/course-landing/course-landing.component';
import { CoursePricingComponent } from './components/pages/instructor/course-manage/course-pricing/course-pricing.component';
import { UserMenuComponent } from './components/common/user-menu/user-menu.component';
import { ResetPasswordPageComponent } from './components/pages/reset-password-page/reset-password-page.component';
import { ToastrModule } from 'ngx-toastr';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PlayerLayoutComponent } from './layouts/player-layout/player-layout.component';
import { SidebarComponent } from './components/common/sidebar/sidebar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarViewComponent } from './components/dashboard/calendar-view/calendar-view.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CourseCardComponent } from './components/common/course-card/course-card.component';
import { CompanyEmployeesComponent } from './components/dashboard/company-employees/company-employees.component';
import { NgSelectModule } from '@ng-select/ng-select'; 
import { AccountVerificationComponent } from './components/pages/login-page/account-verification/account-verification.component';
import { LibraryComponent } from './components/pages/instructor/library/library.component';
import { UploadWidgetComponent } from './components/common/upload-widget/upload-widget.component';
import { UploadModalComponent } from './components/common/modals/upload-modal/upload-modal.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { SafeUrlPipe } from './shared/pipes/safe-url.pipe';
import { ContentPreviewModalComponent } from './components/common/modals/content-preview-modal/content-preview-modal.component';
import { DialogModule } from 'primeng/dialog';
import { ContentLibrarySelectorComponent } from './components/common/content-library-selector/content-library-selector.component';
import { TooltipModule } from 'primeng/tooltip';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BecomeInstructorComponent } from './components/pages/instructor/become-instructor/become-instructor.component';
import { NgxEditorModule } from 'ngx-editor';
import { CourseSettingsComponent } from './components/pages/instructor/course-manage/course-settings/course-settings.component';
import { ExamBuilderComponent } from './components/pages/instructor/course-manage/curriculum/exam-builder/exam-builder.component';
import { ExamLibraryComponent } from './components/pages/instructor/exam-library/exam-library.component';
import { ExamSelectorComponent } from 'src/app/components/common/exam-selector/exam-selector.component';
import { ExamRunnerComponent } from './components/student/exam-runner/exam-runner.component'; 
import { ExamSidebarComponent } from './components/student/exam-runner/exam-sidebar/exam-sidebar.component';
import { ExamQuestionComponent } from './components/student/exam-runner/exam-question/exam-question.component'; 

@NgModule({
    declarations: [
        AppComponent,
        HomeDemoOneComponent,
        HomeDemoTwoComponent,
        HomeDemoThreeComponent,
        NavbarComponent,
        FooterComponent,
        NotFoundComponent,
        BlogComponent,
        PartnerComponent,
        FeaturesComponent,
        SubscribeComponent,
        FeedbackComponent,
        InstructorsComponent,
        AboutComponent,
        FeaturedComponent,
        CategoriesComponent,
        CoursesToledoComponent,
        CoursesComponent,
        FeaturedCoursesComponent,
        HomeoneBannerComponent,
        TopRatedCoursesComponent,
        FunfactsComponent,
        FeaturedBoxesComponent,
        HometwoBannerComponent,
        TopHeaderComponent,
        OverviewComponent,
        VideoComponent,
        HomethreeBannerComponent,
        ContactPageComponent,
        AboutPageComponent,
        FaqPageComponent,
        PrivacyPolicyPageComponent,
        TermsConditionsPageComponent,
        RegisterPageComponent,
        TestimonialsPageComponent,
        ForgotPasswordPageComponent,
        InstructorsPageComponent,
        InstructorProfilePageComponent,
        SuccessStoriesPageComponent,
        PricingPageComponent,
        EventsPageComponent,
        EventDetailsPageComponent,
        BlogGridPageComponent,
        BlogRightSidebarPageComponent,
        BlogDetailsPageComponent,
        BlogWidgetComponent,
        CoursesGridPageComponent,
        CoursesListPageComponent,
        CourseDetailsPageComponent,
        DashboardComponent,
        EnrolledCoursesComponent,
        WishlistComponent,
        MyProfileComponent,
        CompanyEmployeesComponent,
        ActiveCoursesComponent,
        ReviewsComponent,
        CompletedCoursesComponent,
        CartComponent,
        OrdersListComponent,
        EditProfileComponent,
        LoginPageComponent,
        RegisterPageComponent,
        CourseManageComponent,
        CurriculumComponent,
        InstructorComponent,
        VerifyComponent,
        NewCourseFormComponent,
        CourseContentComponent,
        DynamicDialogComponent,
        CourseSectionComponent,
        WhatYouWillLearnComponent,
        CourseLandingComponent,
        CoursePricingComponent,
        SidebarComponent,
        UserMenuComponent,
        ResetPasswordPageComponent,
        MainLayoutComponent,  
        PlayerLayoutComponent,
        CalendarViewComponent,
        CourseCardComponent,
        AccountVerificationComponent,
        LibraryComponent,
        UploadWidgetComponent,
        UploadModalComponent,
        SafeUrlPipe,
        ContentPreviewModalComponent,
        ContentLibrarySelectorComponent,
        BecomeInstructorComponent,
        CourseSettingsComponent,
        ExamBuilderComponent,
        ExamLibraryComponent,
        ExamSelectorComponent,
        ExamRunnerComponent,
        ExamSidebarComponent,  
        ExamQuestionComponent  
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        PlyrModule,
        NgxScrollTopModule,
        NgbModule,
        DragDropModule,
        MatTabsModule,
        RouterModule,
        ToastrModule.forRoot({positionClass: 'toast-top-right'}),
        StoreModule.forRoot({ course: courseReducer }),
        EffectsModule.forRoot([CourseEffects]),
        FullCalendarModule,
        CarouselModule,
        NgSelectModule,
        DynamicDialogModule,
        DialogModule,
        TooltipModule,
        NgxExtendedPdfViewerModule,
        NgxEditorModule
    ],
    exports: [
    ExamSelectorComponent // Dışarıya aç (Burası önemli!)
  ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true,
            
        },
        DialogService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }