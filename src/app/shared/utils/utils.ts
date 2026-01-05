import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Utils {
    constructor() {}

    calculateCourseContentIndexes(courseContent: any[]) {
        let globalLectureIndex = 0;
        let globalExamIndex = 0;

        courseContent.forEach((section) => {
            section.trainingContents.forEach((content: any) => {
                if (content.contentType.code === 'lec') {
                    globalLectureIndex++;
                    content.globalIndex = globalLectureIndex;
                } else {
                    globalExamIndex++;
                    content.globalIndex = globalExamIndex;
                }
            });
        });
    }
}
