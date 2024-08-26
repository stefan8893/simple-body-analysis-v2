import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { version } from '../../../../../package.json';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent implements OnInit {
  version = version;
  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
      },
      {
        label: 'Täglich',
        icon: 'pi pi-calendar',
      },
      {
        label: 'Wöchentlich',
        icon: 'pi pi-calendar-minus',
      },
      {
        label: 'Tabellarisch',
        icon: 'pi pi-table',
      },
    ];
  }

  items: MenuItem[] | undefined;
}
