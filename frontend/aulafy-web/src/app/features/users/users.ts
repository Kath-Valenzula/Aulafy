import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { RoleName, UserResponse } from '../../shared/models/aulafy.models';

interface UsersPageConfig {
  title: string;
  description: string;
  actionLabel: string;
  roleFilter?: RoleName[];
}

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  template: `
    <section class="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-on-background">{{ config.title }}</h2>
        <p class="text-on-surface-variant">{{ config.description }}</p>
      </div>
      <div class="flex flex-col gap-1 md:items-end">
        <button class="py-2.5 px-5 bg-tertiary-container text-on-tertiary-container rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60" disabled>
          <span class="material-symbols-outlined">person_add</span>
          {{ config.actionLabel }}
        </button>
        <span class="text-xs text-on-surface-variant">Alta manual pendiente de flujo de matricula.</span>
      </div>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando usuarios...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadUsers()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error" class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex items-center justify-between">
        <h3 class="font-semibold text-primary">Directorio</h3>
        <span class="text-xs bg-surface-container-high px-2 py-1 rounded">{{ visibleUsers.length }} registro(s)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th class="px-6 py-4 text-left text-xs uppercase text-on-surface-variant">Nombre</th>
              <th class="px-6 py-4 text-left text-xs uppercase text-on-surface-variant">Correo</th>
              <th class="px-6 py-4 text-left text-xs uppercase text-on-surface-variant">Rol</th>
              <th class="px-6 py-4 text-center text-xs uppercase text-on-surface-variant">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr *ngIf="!visibleUsers.length">
              <td colspan="4" class="px-6 py-4 text-sm text-on-surface-variant">No hay usuarios para el filtro seleccionado.</td>
            </tr>
            <tr *ngFor="let user of visibleUsers" class="hover:bg-surface-container-highest">
              <td class="px-6 py-3 font-medium">{{ user.fullName }}</td>
              <td class="px-6 py-3">{{ user.email }}</td>
              <td class="px-6 py-3">{{ roleLabel(user.role) }}</td>
              <td class="px-6 py-3 text-center">
                <span class="px-2 py-1 rounded-full text-xs" [ngClass]="user.active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  users: UserResponse[] = [];
  loading = true;
  error = '';
  config: UsersPageConfig = {
    title: 'Gestion de usuarios',
    description: 'Administra cuentas y roles principales del sistema.',
    actionLabel: 'Crear usuario'
  };

  get visibleUsers(): UserResponse[] {
    if (!this.config.roleFilter?.length) {
      return this.users;
    }
    return this.users.filter((user) => this.config.roleFilter!.includes(user.role));
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.config = {
        title: data['title'] ?? 'Gestion de usuarios',
        description: data['description'] ?? 'Administra cuentas y roles principales del sistema.',
        actionLabel: data['actionLabel'] ?? 'Crear usuario',
        roleFilter: data['roleFilter'] as RoleName[] | undefined
      };
      this.loadUsers();
    });
  }

  roleLabel(role: RoleName): string {
    if (role === 'ADMIN') {
      return 'Administrador';
    }
    if (role === 'COLEGIO') {
      return 'Colegio';
    }
    if (role === 'PROFESOR') {
      return 'Profesor';
    }
    if (role === 'APODERADO') {
      return 'Apoderado';
    }
    return 'Estudiante';
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
