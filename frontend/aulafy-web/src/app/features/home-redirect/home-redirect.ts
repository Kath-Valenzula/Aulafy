import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home-redirect',
  template: ''
})
export class HomeRedirectComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    const target = this.auth.hasAnyRole(['APODERADO', 'ESTUDIANTE']) ? '/app/guardian' : '/app/dashboard';
    void this.router.navigateByUrl(target);
  }
}
