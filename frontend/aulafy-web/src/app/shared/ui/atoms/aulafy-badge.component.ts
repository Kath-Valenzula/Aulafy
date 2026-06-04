import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-aulafy-badge',
  imports: [CommonModule],
  template: `<span class="aui-chip" [ngClass]="tone">{{ label }}</span>`
})
export class AulafyBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: BadgeTone = 'neutral';
}
