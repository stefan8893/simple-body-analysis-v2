import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonModule, ContentHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
