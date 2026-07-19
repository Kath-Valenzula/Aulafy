import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  AcademicStructureService,
  AcademicStudentResponse
} from '../../core/services/academic-structure.service';
import { UserResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  template: `
    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
      Cargando perfil...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadProfile()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <ng-container *ngIf="!loading && !error && user">
      <section class="flex flex-col items-center text-center mb-6">
        <div class="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-3xl font-bold">
          {{ initials }}
        </div>
        <h2 class="text-xl font-semibold mt-3">{{ user.fullName }}</h2>
        <span class="inline-flex px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs mt-2">
          {{ roleLabel }}
        </span>
      </section>

      <section class="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden mb-5">
        <div class="p-4 border-b border-outline-variant/20">
          <h3 class="font-semibold">Cuenta</h3>
        </div>
        <div class="p-4 space-y-3">
          <div>
            <p class="text-xs uppercase text-on-surface-variant">Correo</p>
            <p class="font-medium">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-xs uppercase text-on-surface-variant">Alcance visible</p>
            <p class="text-sm text-on-surface-variant">{{ scopeText }}</p>
          </div>
        </div>
      </section>

      <section class="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden mb-5">
        <div class="p-4 border-b border-outline-variant/20">
          <h3 class="font-semibold">Vinculos academicos</h3>
        </div>
        <div class="p-4">
          <p *ngIf="!students.length" class="text-sm text-on-surface-variant">
            No existen estudiantes asociados para este perfil.
          </p>
          <div *ngIf="students.length" class="space-y-3">
            <article *ngFor="let student of students" class="bg-surface-container-low rounded-lg border border-outline-variant p-3">
              <p class="font-semibold">{{ student.fullName }}</p>
              <p class="text-sm text-on-surface-variant">{{ student.level.name }} {{ student.section }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-outline-variant/20"><h3 class="font-semibold">Notificaciones</h3></div>
        <div class="p-4">
          <p class="text-sm text-on-surface-variant">
            Las preferencias de notificacion se configuraran cuando el modulo de avisos personales quede cerrado para el MVP.
          </p>
        </div>
      </section>
    </ng-container>
  `
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly academicStructureService = inject(AcademicStructureService);

  user: UserResponse | null = null;
  students: AcademicStudentResponse[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    const name = this.user?.fullName ?? 'Aulafy';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token.charAt(0).toUpperCase())
      .join('');
  }

  get roleLabel(): string {
    return this.user?.role === 'ESTUDIANTE' ? 'Estudiante' : 'Apoderado';
  }

  get scopeText(): string {
    return this.user?.role === 'ESTUDIANTE'
      ? 'Solo informacion academica propia.'
      : 'Solo informacion de estudiantes vinculados.';
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      user: this.auth.loadProfile(),
      students: this.academicStructureService.students()
    }).subscribe({
      next: ({ user, students }) => {
        this.user = user;
        this.students = students;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}
