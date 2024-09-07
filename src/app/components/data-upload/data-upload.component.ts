import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { StepperModule } from 'primeng/stepper';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-data-upload',
  standalone: true,
  imports: [ContentHeaderComponent, StepperModule, ButtonModule, CardModule],
  templateUrl: './data-upload.component.html',
  styleUrl: './data-upload.component.scss',
})
export class DataUploadComponent {}
