import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CurrAccApiService, CompanyDto } from 'src/app/shared/api/curr-acc-api.service';
import { Subject, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, startWith } from 'rxjs/operators';

export interface ManagedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  title: string | null;
  companyName: string | null;
  isActive: boolean;
  status: string;
  viewMode: 'AdminView' | 'CompanyView' | 'InstructorView';
}

@Component({
  selector: 'app-company-employees',
  templateUrl: './company-employees.component.html',
  styleUrls: ['./company-employees.component.scss']
})
export class CompanyEmployeesComponent implements OnInit {

  users: ManagedUser[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Modal ve Form Değişkenleri
  @ViewChild('userModal') userModal!: TemplateRef<any>;
  userForm!: FormGroup;
  isEditMode = false;
  selectedUserId: number | null = null;
  isSaving = false;
  
  // Yetki ve Firma Yönetimi
  currentCompanyId: number = 0;
  isAdmin = false;
  
  // NG-SELECT (Firma Arama) Değişkenleri
  companyList$: Observable<CompanyDto[]> | undefined;
  companyLoading = false;
  companyInput$ = new Subject<string>();

  constructor(
    private userApiService: UserApiService,
    private currAccApiService: CurrAccApiService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService
  ) { 
    // Formu Hazırla
    this.userForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        surName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.minLength(14)]],
        currAccId: [null, Validators.required]
    });

    // --- YETKİ VE ROL KONTROLÜ ---
    const currentUser = this.authService.currentUserValue;
    if(currentUser) {
        // Roles dizisi kontrolü
        if (currentUser.roles && Array.isArray(currentUser.roles)) {
            const lowerRoles = currentUser.roles.map((r: any) => r.toString().toLowerCase());
            if (lowerRoles.includes('superadmin') || lowerRoles.includes('admin') || lowerRoles.includes('sa')) {
                this.isAdmin = true;
            }
        }
        // Token decode kontrolü (Yedek)
        if (!this.isAdmin && currentUser.accessToken) {
            try {
                const payload = JSON.parse(atob(currentUser.accessToken.split('.')[1]));
                const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
                if (roleClaim) {
                    const rolesArray = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
                    const lowerRoles = rolesArray.map((r: any) => r ? r.toString().toLowerCase() : '');
                    if (lowerRoles.includes('sa') || lowerRoles.includes('superadmin') || lowerRoles.includes('admin')) {
                        this.isAdmin = true;
                    }
                }
            } catch (e) {
                console.error('Token yetki kontrolü sırasında hata:', e);
            }
        }
        if (currentUser.currAccId) {
            this.currentCompanyId = currentUser.currAccId;
        }
    }
  }

  ngOnInit(): void {
    this.fetchUsers();
    if (this.isAdmin) {
        this.loadCompanies();
    }
  }

  get f() { return this.userForm.controls; }

  // 1. LİSTELEME
  fetchUsers() {
    this.isLoading = true;
    this.userApiService.getManagedUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Personel listesi yüklenirken bir hata oluştu.';
        this.isLoading = false;
      }
    });
  }

  // 2. FİRMA ARAMA
  loadCompanies() {
      this.companyList$ = this.companyInput$.pipe(
          startWith(''), // Başlangıçta boş değer ile tetikle
          debounceTime(500),
          distinctUntilChanged(),
          tap(() => this.companyLoading = true),
          switchMap(term => {
              // Boş gelirse backend'e boş string gider, backend hepsini döner
              return this.currAccApiService.getCompanies(term).pipe(
                  catchError(() => of([])),
                  tap(() => this.companyLoading = false)
              );
          })
      );
  }

  // 3. MODAL AÇMA (EKLEME)
  openAddModal() {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset();
    
    if (this.isAdmin) {
        this.userForm.get('currAccId')?.enable();
        this.userForm.patchValue({ currAccId: null }); 
        
        // Modalın animasyonu bitip DOM'a yerleşmesi için biraz bekle ve listeyi tetikle
        setTimeout(() => {
            this.companyInput$.next(''); 
        }, 200); 
    } else {
        this.userForm.patchValue({ currAccId: this.currentCompanyId });
    }
    
    this.userForm.get('email')?.enable();

    this.modalService.open(this.userModal, { backdrop: 'static', size: 'lg', centered: true });
  }

  // ... (Diğer metodlar aynı: openEditModal, saveUser, deleteUser, toggleUserStatus, onDynamicInput vb.)
  // Bunlar değişmediği için kod kalabalığı yapmamak adına tekrar yazmıyorum.
  // Eski dosyadaki diğer fonksiyonları olduğu gibi koruyabilirsin.
  
  // 4. MODAL AÇMA (DÜZENLEME)
  openEditModal(user: ManagedUser) {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    
    this.userForm.patchValue({
        name: user.firstName,
        surName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currAccId: this.currentCompanyId 
    });

    this.userForm.get('email')?.disable();
    this.modalService.open(this.userModal, { backdrop: 'static', size: 'lg', centered: true });
  }

  // 5. KAYDET
  saveUser() {
    if (this.userForm.invalid) {
        this.userForm.markAllAsTouched();
        return;
    }

    this.isSaving = true;
    const formData = this.userForm.getRawValue();

    if (this.isEditMode && this.selectedUserId) {
        const updatePayload = {
            id: this.selectedUserId,
            name: formData.name,
            surName: formData.surName,
            currAccId: formData.currAccId
        };
        this.userApiService.updateUser(updatePayload).subscribe({
            next: (res: any) => { 
                if(res && res.header && res.header.result) {
                    this.toastr.success(res.body?.message || 'Personel bilgileri güncellendi.');
                    this.modalService.dismissAll();
                    this.fetchUsers();
                } else {
                    this.toastr.error(res.header?.msg || 'Güncelleme başarısız.');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                this.toastr.error('Bir hata oluştu.');
                this.isSaving = false;
            }
        });
    } else {
        const addPayload = {
            name: formData.name,
            surName: formData.surName,
            email: formData.email,
            phoneNumber: formData.phoneNumber, 
            currAccId: formData.currAccId
        };
        this.userApiService.addUser(addPayload).subscribe({
            next: (res: any) => {
                if(res && res.header && res.header.result) {
                    this.toastr.success(res.body?.message || 'Personel eklendi ve şifresi gönderildi.');
                    this.modalService.dismissAll();
                    this.fetchUsers(); 
                } else {
                    this.toastr.error(res.header?.msg || 'Ekleme başarısız.');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                const errorMsg = err.error?.header?.msg || 'Bir hata oluştu.';
                this.toastr.error(errorMsg);
                this.isSaving = false;
            }
        });
    }
  }

  deleteUser(user: ManagedUser) {
    if(confirm(`${user.firstName} ${user.lastName} personelini silmek istediğinize emin misiniz?`)) {
        this.userApiService.deleteUser(user.id).subscribe({
            next: (res: any) => {
                if(res && res.header && res.header.result) {
                    this.toastr.success('Personel silindi.');
                    this.fetchUsers();
                } else {
                    this.toastr.error(res.header?.msg || res.message || 'Hata oluştu');
                }
            },
            error: (err: any) => this.toastr.error('Silme işleminde hata oluştu.')
        });
    }
  }

  toggleUserStatus(user: ManagedUser) {
    const newStatus = !user.isActive;
    const actionName = newStatus ? 'Aktifleştirmek' : 'Pasife almak';
    
    if(confirm(`${user.firstName} ${user.lastName} kullanıcısını ${actionName} istediğinize emin misiniz?`)) {
        this.userApiService.setUserStatus(user.id, newStatus).subscribe({
            next: (res: any) => {
                if(res && res.header && res.header.result) {
                    this.toastr.success(`Kullanıcı durumu güncellendi.`);
                    this.fetchUsers();
                } else {
                    this.toastr.error(res.header?.msg || res.message || 'Hata oluştu');
                }
            },
            error: (err: any) => this.toastr.error('Durum değiştirilemedi.')
        });
    }
  }

  onDynamicInput(event: any) {
    const input = event.target;
    const originalValue = input.value;
    if (!originalValue) return;

    let numbers = originalValue.replace(/\D/g, '');

    if (numbers.startsWith('0')) { 
        if (numbers.length > 1 && numbers[1] !== '5') { numbers = '0'; } 
    } 
    else if (numbers.startsWith('5')) { numbers = '0' + numbers; } 
    else { numbers = '05' + numbers; }

    if (numbers.length > 11) { numbers = numbers.substring(0, 11); }

    let formatted = "";
    if (numbers.length > 0) formatted = numbers.substring(0, 4);
    if (numbers.length > 4) formatted += " " + numbers.substring(4, 7);
    if (numbers.length > 7) formatted += " " + numbers.substring(7, 9);
    if (numbers.length > 9) formatted += " " + numbers.substring(9, 11);

    input.value = formatted;
    this.userForm.get('phoneNumber')?.setValue(formatted, { emitEvent: false });
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'aktif': return 'bg-success';
      case 'pasif': return 'bg-danger';
      case 'öğrenci': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}