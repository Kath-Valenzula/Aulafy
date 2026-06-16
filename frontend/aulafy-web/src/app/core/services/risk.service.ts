import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskReportResponse } from '../../shared/models/aulafy.models';

@Injectable({ providedIn: 'root' })
export class RiskService {
  private readonly http = inject(HttpClient);

  academicRisk() {
    return this.http.get<RiskReportResponse>(`${environment.apiUrl}/risk/academic`);
  }
}
