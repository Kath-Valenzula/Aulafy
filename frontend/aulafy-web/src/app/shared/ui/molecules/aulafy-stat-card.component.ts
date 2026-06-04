import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type StatTone = 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-aulafy-stat-card',
  imports: [CommonModule],
  template: `
    <article class="aui-stat-card">
      <div>
        <p class="label">{{ label }}</p>
        <p class="value">{{ value }}</p>
        <p class="caption" *ngIf="caption">{{ caption }}</p>
      </div>
      <span class="aui-icon-circle" [ngClass]="tone">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </span>
    </article>
  `
})
export class AulafyStatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() caption = '';
  @Input() icon = 'insights';
  @Input() tone: StatTone = 'primary';
}
