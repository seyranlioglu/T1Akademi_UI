import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class IdValidatorGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const id = route.params['id'];
    const courseManageIdPattern = route.data['courseManageIdPattern'];
    const courseIdPattern= route.data['courseIdPattern'];

    
    if (courseIdPattern && courseIdPattern instanceof RegExp && !courseIdPattern.test(id)) {
       this.router.navigate(['/']);
      return true;
    }

    if (courseManageIdPattern && courseManageIdPattern instanceof RegExp && !courseManageIdPattern.test(id)) {
      this.router.navigate(['/instructor/courses']);
      return false;
    }

    return true;
  }
}
