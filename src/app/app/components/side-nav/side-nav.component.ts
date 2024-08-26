import { Component, OnInit, output, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ChipModule } from 'primeng/chip';
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
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Täglich',
        icon: 'pi pi-calendar',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Wöchentlich',
        icon: 'pi pi-calendar-minus',
        command: () => {
          this.notifyParent();
        },
      },
      {
        label: 'Tabellarisch',
        icon: 'pi pi-table',
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
