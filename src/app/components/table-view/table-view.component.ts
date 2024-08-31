import { Component } from '@angular/core';
import { ContentHeaderComponent } from '../miscellaneous/content-header/content-header.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [ContentHeaderComponent],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
})
export class TableViewComponent {}
