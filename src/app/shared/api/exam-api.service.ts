import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_EXAM_URL = `${environment.apiUrl}/Exam`;

@Injectable({
    providedIn: 'root',
})
export class ExamApiService {
    constructor(private http: HttpClient) {}

    // --- EĞİTMEN / YÖNETİM METOTLARI ---

    // Yeni Sınav Ekleme
    addExam(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddExam`, payload);
    }

    // Sınav Bilgilerini Güncelleme
    updateExam(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateExamInfo`, payload);
    }

    // Manuel Yeni Versiyon Oluşturma
    addNewVersion(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddNewVersion`, payload);
    }

    // Versiyonu Yayınlama
    publishVersion(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/PublishVersion`, payload);
    }

    // Konu Başlığı Ekleme
    addExamTopic(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddExamTopic`, payload);
    }

    // Konu Başlığı Güncelleme
    updateExamTopic(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateTopicInfo`, payload);
    }

    // Konu Başlığı Sıralama
    updateTopicSeqNo(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateSeqNo`, payload);
    }

    // Soru Ekleme
    addExamQuestion(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddExamQuestion`, payload);
    }

    // Soru Güncelleme
    updateExamQuestion(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateQuestion`, payload);
    }

    // Sınav Detayını Getirme (Editör için)
    getExamDetail(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/GetExamDetail`, payload);
    }

    // Sınav Listesi Getirme (Lookup için - Basit Liste)
    getAllExams(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/GetExamListForLookup`, payload);
    }

    // Sınav Kütüphanesi Listesi Getirme (Detaylı - İstatistikli)
    getInstructorExamLibrary(): Observable<any> {
        return this.http.get<any>(`${API_EXAM_URL}/GetInstructorExamLibrary`);
    }

    // Sınavın versiyon geçmişini getirir
    getExamVersions(examId: number): Observable<any> {
        return this.http.get<any>(`${API_EXAM_URL}/GetExamVersions/${examId}`);
    }

    // --- ÖĞRENCİ / SINAV OLMA METOTLARI ---

    // Sınavı Hazırla/Başlat
    prePrepareExamForStudent(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/PrePrepareExamForStudent`, payload);
    }

    // Sınavı Getir (Öğrenci Gözüyle)
    getExamByIdWithStudent(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/GetExamByIdWithStudent`, payload);
    }

    // Sıradaki Soruyu Getir
    getNextQuestion(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/GetNextQuestion`, payload);
    }

    // Sınavı Bitir ve Sonucu Hesapla
    calculateExamResult(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/CalculateExamResult`, payload);
    }

    updateSeqNo(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateSeqNo`, payload);
    }
}