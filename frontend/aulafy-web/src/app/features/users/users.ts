import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { RoleName, UserResponse } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Administracion</span>
        <h2>Usuarios</h2>
      </div>
    </section>

    <section class="work-area">
      <h3>Crear usuario</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Nombre
          <input formControlName="fullName" />
        </label>
        <label>
          Correo
          <input type="email" formControlName="email" />
        </label>
        <label>
          Contrasena
          <input type="password" formControlName="password" />
        </label>
        <label>
          Rol
          <select formControlName="role">
            <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
          </select>
        </label>
        <label>
          Telegram chat id
          <input formControlName="telegramChatId" />
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid">Crear</button>
      </form>
    </section>

    <section class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td><span class="status" [class.off]="!user.active">{{ user.active ? 'Activo' : 'Inactivo' }}</span></td>
            <td><button class="button ghost" type="button" (click)="toggle(user)">{{ user.active ? 'Desactivar' : 'Activar' }}</button></td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  users: UserResponse[] = [];
  roles: RoleName[] = ['ADMIN', 'COLEGIO', 'PROFESOR', 'APODERADO', 'ESTUDIANTE'];
  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['ESTUDIANTE' as RoleName, [Validators.required]],
    telegramChatId: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.usersService.create({ ...value, telegramChatId: value.telegramChatId || null }).subscribe((user) => {
      this.users = [...this.users, user].sort((a, b) => a.fullName.localeCompare(b.fullName));
      this.form.reset({ fullName: '', email: '', password: '', role: 'ESTUDIANTE', telegramChatId: '' });
    });
  }

  toggle(user: UserResponse): void {
    this.usersService.updateStatus(user.id, !user.active).subscribe((updated) => {
      this.users = this.users.map((item) => item.id === updated.id ? updated : item);
    });
  }

  private load(): void {
    this.usersService.findAll().subscribe((users) => this.users = users);
  }
}
