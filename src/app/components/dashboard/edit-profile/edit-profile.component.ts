import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  editProfileForm: any;

  constructor(private userApiService: UserApiService, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadUserProfile();
  }

  buildForm() {
    this.editProfileForm = this.fb.group({
      name: [null, Validators.required],
      surName: [null, Validators.required],
    });
  }

  loadUserProfile() {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.userApiService.getUserById(userId).subscribe((response: any) => {
        if (response.body) {
          const user = response.body;
          this.editProfileForm.patchValue({
            name: user.name,
            surName: user.surName,
          });
        }
      });
    }
  }

  submit() {
    if (this.editProfileForm.valid) {
      const { id, currAccId } = this.authService.currentUserValue;

      if (id) {
        this.userApiService.updateUser({ id, currAccId, ...this.editProfileForm.value }).subscribe((response: any) => {

        });
      }
    }
  }
}
