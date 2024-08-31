import { Component } from '@angular/core';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-weekly-analysis',
  standalone: true,
  imports: [ContentHeaderComponent],
  templateUrl: './weekly-analysis.component.html',
  styleUrl: './weekly-analysis.component.scss',
})
export class WeeklyAnalysisComponent {}
