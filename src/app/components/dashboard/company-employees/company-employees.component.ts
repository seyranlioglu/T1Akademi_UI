import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

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
  
  currentCompanyId: number = 0;

  constructor(
    private userApiService: UserApiService,
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
        phoneNumber: ['', [Validators.required, Validators.minLength(14)]], // Formatlı uzunluk kontrolü
        currAccId: [0]
    });

    // Giriş yapan kullanıcının firma ID'sini al
    const currentUser = this.authService.currentUserValue;
    if(currentUser && currentUser.currAccId) {
        this.currentCompanyId = currentUser.currAccId;
    }
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Form getter (HTML'de f.name diyebilmek için)
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
        console.error('Listeleme hatası:', err);
        this.errorMessage = 'Personel listesi yüklenirken bir hata oluştu.';
        this.isLoading = false;
      }
    });
  }

  // 2. MODAL AÇMA (EKLEME)
  openAddModal() {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset();
    
    this.userForm.patchValue({ currAccId: this.currentCompanyId });
    this.userForm.get('email')?.enable();

    this.modalService.open(this.userModal, { backdrop: 'static', size: 'lg', centered: true });
  }

  // 3. MODAL AÇMA (DÜZENLEME)
  openEditModal(user: ManagedUser) {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    
    // Telefon numarasını formatlı göstermek isteyebilirsin, şimdilik direkt veriyoruz
    this.userForm.patchValue({
        name: user.firstName,
        surName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber, // Formatız gelirse formatlamak gerekebilir
        currAccId: this.currentCompanyId
    });

    this.userForm.get('email')?.disable();

    this.modalService.open(this.userModal, { backdrop: 'static', size: 'lg', centered: true });
  }

  // 4. KAYDET (Add veya Update)
saveUser() {
    if (this.userForm.invalid) {
        this.userForm.markAllAsTouched();
        return;
    }

    this.isSaving = true;
    const formData = this.userForm.getRawValue();

    if (this.isEditMode && this.selectedUserId) {
        // --- GÜNCELLEME ---
        const updatePayload = {
            id: this.selectedUserId,
            name: formData.name,
            surName: formData.surName,
            currAccId: this.currentCompanyId
        };

        this.userApiService.updateUser(updatePayload).subscribe({
            next: (res: any) => { 
                // GÜNCELLEME: Response yapısına göre kontrol (header.result veya body.result)
                if(res && res.header && res.header.result) {
                    this.toastr.success(res.body?.message || 'Personel bilgileri güncellendi.');
                    this.modalService.dismissAll();
                    this.fetchUsers(); // Listeyi yenile
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
        // --- EKLEME ---
        const addPayload = {
            name: formData.name,
            surName: formData.surName,
            email: formData.email,
            phoneNumber: formData.phoneNumber, 
            currAccId: this.currentCompanyId
        };

        this.userApiService.addUser(addPayload).subscribe({
            next: (res: any) => {
                // GÜNCELLEME: Backend { header: { result: true }, body: {...} } dönüyor.
                // Biz yanlışlıkla res.result bakıyorduk, o yüzden hata sanıyordu.
                if(res && res.header && res.header.result) {
                    this.toastr.success(res.body?.message || 'Personel eklendi ve şifresi gönderildi.');
                    this.modalService.dismissAll(); // Modalı kapat
                    this.fetchUsers(); // LİSTEYİ YENİLE
                } else {
                    this.toastr.error(res.header?.msg || 'Ekleme başarısız.');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                // Backend validasyon hatası dönerse mesajı yakala
                const errorMsg = err.error?.header?.msg || 'Bir hata oluştu.';
                this.toastr.error(errorMsg);
                this.isSaving = false;
            }
        });
    }
  }

  // 5. SİLME
  deleteUser(user: ManagedUser) {
    if(confirm(`${user.firstName} ${user.lastName} personelini silmek istediğinize emin misiniz?`)) {
        this.userApiService.deleteUser(user.id).subscribe({
            next: (res: any) => {
                if(res.result) {
                    this.toastr.success('Personel silindi.');
                    this.fetchUsers();
                } else {
                    this.toastr.error(res.message);
                }
            },
            error: (err: any) => this.toastr.error('Silme işleminde hata oluştu.')
        });
    }
  }

  // 6. DURUM DEĞİŞTİRME
  toggleUserStatus(user: ManagedUser) {
    const newStatus = !user.isActive;
    const actionName = newStatus ? 'Aktifleştirmek' : 'Pasife almak';
    
    if(confirm(`${user.firstName} ${user.lastName} kullanıcısını ${actionName} istediğinize emin misiniz?`)) {
        this.userApiService.setUserStatus(user.id, newStatus).subscribe({
            next: (res: any) => {
                if(res.result) {
                    this.toastr.success(`Kullanıcı durumu güncellendi.`);
                    this.fetchUsers();
                } else {
                    this.toastr.error(res.message);
                }
            },
            error: (err: any) => this.toastr.error('Durum değiştirilemedi.')
        });
    }
  }

  // --- TELEFON FORMATLAMA ---
  onDynamicInput(event: any) {
    const input = event.target;
    const originalValue = input.value;
    if (!originalValue) return;

    // Sadece rakamları al
    let numbers = originalValue.replace(/\D/g, '');

    // Başlangıç kontrolü (05... formatı)
    if (numbers.startsWith('0')) { 
        if (numbers.length > 1 && numbers[1] !== '5') { numbers = '0'; } 
    } 
    else if (numbers.startsWith('5')) { numbers = '0' + numbers; } 
    else { numbers = '05' + numbers; }

    // Maksimum uzunluk (11 hane: 05XX...)
    if (numbers.length > 11) { numbers = numbers.substring(0, 11); }

    // Formatlama: 05XX XXX XX XX
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