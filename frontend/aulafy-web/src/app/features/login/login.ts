import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-page">
      <section class="login-panel">
        <div class="login-copy">
          <img src="/aulafy-logo.png" alt="Aulafy" style="height:220px;width:auto;" />
          <p>Comunicacion escolar, calendario, notas y asistencia en una sola plataforma.</p>
        </div>

        <form class="login-form" [formGroup]="form" (ngSubmit)="submit()">
          <h2>Ingresar</h2>
          <label>
            Correo
            <input type="email" formControlName="email" autocomplete="email" />
          </label>
          <label>
            Contrasena
            <input type="password" formControlName="password" autocomplete="current-password" />
          </label>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button class="button primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Ingresando...' : 'Entrar' }}
          </button>
          <div class="demo-users">
            <strong>Demo</strong>
            <span>admin@aulafy.cl / Admin1234</span>
            <span>colegio@aulafy.cl / Colegio1234</span>
            <span>apoderado@aulafy.cl / Apoderado1234</span>
            <span>profesor.jefe@aulafy.cl / ProfesorJefe1234</span>
            <span>profesor.asignatura@aulafy.cl / ProfesorAsignatura1234</span>
            <span>estudiante@aulafy.cl / Estudiante1234</span>
          </div>
        </form>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  form = this.fb.nonNullable.group({
    email: ['admin@aulafy.cl', [Validators.required, Validators.email]],
    password: ['Admin1234', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/app/home'),
      error: () => {
        this.error = 'Credenciales invalidas o servicio no disponible. Intenta nuevamente.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
