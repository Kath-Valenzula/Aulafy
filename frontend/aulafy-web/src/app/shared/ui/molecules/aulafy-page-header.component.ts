import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aulafy-page-header',
  imports: [CommonModule],
  template: `
    <section class="aui-page-header">
      <div>
        <span class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ng-content />
    </section>
  `
})
export class AulafyPageHeaderComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
