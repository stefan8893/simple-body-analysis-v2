import { Component } from '@angular/core';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-daily-analysis',
  standalone: true,
  imports: [ContentHeaderComponent],
  templateUrl: './daily-analysis.component.html',
  styleUrl: './daily-analysis.component.scss',
})
export class DailyAnalysisComponent {}
