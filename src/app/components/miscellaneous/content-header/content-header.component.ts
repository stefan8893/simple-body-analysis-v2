import { Component, input } from '@angular/core';

@Component({
  selector: 'app-content-header',
  standalone: true,
  imports: [],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.scss',
})
export class ContentHeaderComponent {
  title = input('');
}
