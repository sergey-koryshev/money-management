import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { Shade } from '@app/helpers/colors.helper';

@Component({
  selector: 'app-round-button',
  templateUrl: './round-button.component.html',
  styleUrls: ['./round-button.component.scss']
})
export class RoundButtonComponent implements AfterViewInit {

  @Input()
  backgroundColor: string;

  currentBackgroundColor: string;
  lighterBackgroundColor: string;

  ngAfterViewInit(): void {
    this.currentBackgroundColor = this.backgroundColor;
    this.lighterBackgroundColor = Shade(this.backgroundColor, -20);
  }

  onMouseOver() {
    this.currentBackgroundColor = this.lighterBackgroundColor;
  }

  onMouseLeave() {
    this.currentBackgroundColor = this.backgroundColor;
  }
}
