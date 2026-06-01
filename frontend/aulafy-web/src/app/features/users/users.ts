import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  template: `
    <section class="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-on-background">Directorio de Estudiantes</h2>
        <p class="text-on-surface-variant">Gestiona y monitorea el rendimiento académico del alumnado.</p>
      </div>
      <button class="py-2.5 px-5 bg-tertiary-container text-on-tertiary-container rounded-lg font-semibold flex items-center gap-2">
        <span class="material-symbols-outlined">person_add</span>
        Matricular alumno
      </button>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant p-4 mb-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
      <select class="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2">
        <option>7mo Básico A</option>
      </select>
      <select class="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2">
        <option>Todos los estados</option>
      </select>
      <select class="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2">
        <option>Cualquiera</option>
      </select>
      <button class="px-4 py-2 border border-outline-variant rounded-lg">Limpiar</button>
    </section>

    <section class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Estudiante</th>
              <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">RUT</th>
              <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Asistencia</th>
              <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Promedio</th>
              <th class="px-6 py-4 text-xs uppercase text-on-surface-variant">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr class="hover:bg-surface-container-highest">
              <td class="px-6 py-3 font-medium">Soto, Martina</td>
              <td class="px-6 py-3">22.456.789-0</td>
              <td class="px-6 py-3">95%</td>
              <td class="px-6 py-3">6.8</td>
              <td class="px-6 py-3"><span class="px-2 py-1 rounded-full text-xs bg-secondary-container text-on-secondary-container">Activo</span></td>
            </tr>
            <tr class="hover:bg-surface-container-highest bg-error-container/10">
              <td class="px-6 py-3 font-medium">Silva, Tomás</td>
              <td class="px-6 py-3">21.876.543-K</td>
              <td class="px-6 py-3 text-error">78%</td>
              <td class="px-6 py-3 text-error">3.8</td>
              <td class="px-6 py-3"><span class="px-2 py-1 rounded-full text-xs bg-error-container text-on-error-container">Riesgo</span></td>
            </tr>
            <tr class="hover:bg-surface-container-highest">
              <td class="px-6 py-3 font-medium">Valdés, Camila</td>
              <td class="px-6 py-3">22.111.222-3</td>
              <td class="px-6 py-3">88%</td>
              <td class="px-6 py-3">5.5</td>
              <td class="px-6 py-3"><span class="px-2 py-1 rounded-full text-xs bg-surface-variant text-on-surface-variant">Inactivo</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class UsersComponent {
}
