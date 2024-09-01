import { Component, OnInit, output, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import packageInfo from '../../../../../package.json';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [MenuModule, ChipModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent implements OnInit {
  menuItemSelected = output();
  version = packageInfo.version;
  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/app',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Täglich',
        icon: 'pi pi-calendar',
        routerLink: '/app/daily',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Wöchentlich',
        icon: 'pi pi-calendar-minus',
        routerLink: '/app/weekly',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Tabellenansicht',
        icon: 'pi pi-table',
        routerLink: '/app/table',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Profil',
        icon: 'pi pi-user',
        routerLink: '/app/profile',
        command: () => {
          this.notifyParent();
        },
      },
    ];
  }

  items: MenuItem[] | undefined;

  notifyParent() {
    this.menuItemSelected.emit();
  }
}
