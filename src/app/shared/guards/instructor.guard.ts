import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class InstructorGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    canActivate() {
        const currentUser = this.authService.currentUserValue;

        if (currentUser.instructorCode) {
            return true;
        }

        this.authService.logout();
        return false;
    }
}
