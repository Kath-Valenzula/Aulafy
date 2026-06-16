import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { homePathForRole } from '../../core/navigation/role-navigation';

@Component({
  selector: 'app-home-redirect',
  template: ''
})
export class HomeRedirectComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    void this.router.navigateByUrl(homePathForRole(this.auth.currentUser?.role));
  }
}
