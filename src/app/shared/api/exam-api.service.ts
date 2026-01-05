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

    addExam(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddExam`, payload);
    }
    updateExam(payload: any): Observable<any> {
        return this.http.put<any>(`${API_EXAM_URL}/UpdateExamInfo`, payload);
    }
    addExamTopic(payload: any): Observable<any> {
        return this.http.post<any>(`${API_EXAM_URL}/AddExamTopic`, payload);
    }
    addExamQuestion(payload: any): Observable<any[]> {
        return this.http.post<any[]>(
            `${API_EXAM_URL}/AddExamQuestion`,
            payload
        );
    }
    getExamDetail(payload: any): Observable<any> {
        return this.http.post<any>(
            `${API_EXAM_URL}/GetExamDetail`,
            payload
        );
    }
    getAllExams(payload: any): Observable<any> {
        return this.http.post<any>(
            `${API_EXAM_URL}/GetExamListForLookup`,
            payload
        );
    }
}
