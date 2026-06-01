import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-risk',
  imports: [CommonModule],
  template: `
    <section class="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-on-background">Reporte de Riesgo Académico</h2>
        <p class="text-on-surface-variant">Análisis de rendimiento y asistencia bajo umbral.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-4 py-2 rounded-lg border border-primary text-primary font-semibold">Exportar PDF</button>
        <button class="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant">Exportar Excel</button>
      </div>
    </section>

    <section class="bg-surface rounded-xl p-4 shadow-sm border border-outline-variant/50 flex flex-wrap gap-4 items-end mb-5">
      <select class="h-10 rounded-lg border-outline-variant bg-surface text-sm px-3">
        <option>Primer Semestre 2024</option>
      </select>
      <select class="h-10 rounded-lg border-outline-variant bg-surface text-sm px-3">
        <option>Todos los niveles</option>
      </select>
      <select class="h-10 rounded-lg border-outline-variant bg-surface text-sm px-3">
        <option>Cualquiera (Notas o Asistencia)</option>
      </select>
      <button class="h-10 px-6 bg-primary-container text-on-primary rounded-lg font-semibold">Aplicar filtros</button>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
        <p class="text-xs uppercase text-on-surface-variant">Alumnos en riesgo</p>
        <p class="text-5xl font-bold text-error mt-2">42</p>
      </article>
      <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
        <p class="text-xs uppercase text-on-surface-variant mb-3">Motivo principal</p>
        <p class="text-sm">Rendimiento: <strong>28</strong></p>
        <p class="text-sm">Asistencia: <strong>14</strong></p>
      </article>
      <article class="bg-surface rounded-xl p-6 border border-outline-variant/50">
        <p class="text-xs uppercase text-on-surface-variant mb-3">Severidad</p>
        <div class="flex gap-4">
          <div class="text-center"><div class="w-12 h-12 rounded-full bg-error-container flex items-center justify-center font-bold">12</div><span class="text-xs">Crítico</span></div>
          <div class="text-center"><div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-bold">30</div><span class="text-xs">Moderado</span></div>
        </div>
      </article>
    </section>

    <section class="bg-surface rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
      <div class="p-4 border-b border-outline-variant bg-surface-bright">
        <h3 class="text-xl font-semibold">Lista priorizada de alumnos</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant">
            <tr>
              <th class="p-4 text-left">Estudiante</th>
              <th class="p-4 text-left">Curso</th>
              <th class="p-4 text-center">Promedio</th>
              <th class="p-4 text-center">Asistencia</th>
              <th class="p-4 text-left">Motivo</th>
              <th class="p-4 text-left">Severidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/30">
            <tr>
              <td class="p-4 font-medium">Martina Vargas</td>
              <td class="p-4">2º Medio A</td>
              <td class="p-4 text-center text-error font-bold">2.8</td>
              <td class="p-4 text-center">88%</td>
              <td class="p-4">Rendimiento</td>
              <td class="p-4"><span class="px-2 py-1 rounded-full text-xs bg-error-container text-on-error-container">Crítico</span></td>
            </tr>
            <tr class="bg-surface-bright">
              <td class="p-4 font-medium">Tomás Sepúlveda</td>
              <td class="p-4">3º Medio B</td>
              <td class="p-4 text-center">4.2</td>
              <td class="p-4 text-center text-error font-bold">71%</td>
              <td class="p-4">Inasistencias continuas</td>
              <td class="p-4"><span class="px-2 py-1 rounded-full text-xs bg-error-container text-on-error-container">Crítico</span></td>
            </tr>
            <tr>
              <td class="p-4 font-medium">Camila Rojas</td>
              <td class="p-4">1º Medio A</td>
              <td class="p-4 text-center">3.8</td>
              <td class="p-4 text-center">92%</td>
              <td class="p-4">Rendimiento (Lenguaje)</td>
              <td class="p-4"><span class="px-2 py-1 rounded-full text-xs bg-surface-variant text-on-surface-variant">Moderado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class RiskComponent {}
