import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent {
  private subscribe: Subscription[] = [];

  userInfo: any = {};

  constructor(private userApiService: UserApiService, private authService: AuthService, public router: Router) {
  }
  ngOnInit(): void {
    const apiSubs = this.userApiService.getUserById(this.authService.currentUserValue?.id).subscribe((response: any) => {
      if (response.body) {
        this.userInfo = response.body;
      }
    });
    this.subscribe.push(apiSubs);
  }

  ngOnDestroy(): void {
    this.subscribe.forEach((s) => s.unsubscribe());
  }

}
