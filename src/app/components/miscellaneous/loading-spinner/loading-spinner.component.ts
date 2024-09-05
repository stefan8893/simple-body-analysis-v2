import { Component, effect, input, ViewEncapsulation } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoadingSpinnerComponent {
  show = input(false);
  debounceTimeInMilliseconds = input(400);

  spin = false;
  startUpDelay: NodeJS.Timeout | undefined;

  constructor() {
    effect(() => {
      if (this.show()) {
        this.startSpinning();
      } else {
        this.stopSpinning();
      }
    });
  }

  startSpinning() {
    this.startUpDelay = setTimeout(() => {
      this.spin = true;
    }, this.debounceTimeInMilliseconds());
  }

  stopSpinning() {
    if (!!this.startUpDelay) {
      clearTimeout(this.startUpDelay);
    }

    this.spin = false;
  }
}
