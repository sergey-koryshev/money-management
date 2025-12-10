import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { shade } from '@app/helpers/colors.helper';

@Component({
  selector: 'app-round-button',
  templateUrl: './round-button.component.html',
  styleUrls: ['./round-button.component.scss']
})
export class RoundButtonComponent implements OnInit {

  @Input()
  backgroundColor: string;

  @Input()
  enableShadow = false;

  currentBackgroundColor: string;
  lighterBackgroundColor: string;
  shadowColor: string;

  ngOnInit(): void {
    this.currentBackgroundColor = this.backgroundColor;
    this.lighterBackgroundColor = shade(this.backgroundColor, -20);

    if (this.enableShadow) {
      this.shadowColor = shade(this.backgroundColor, -80);
    }
  }

  onMouseOver() {
    this.currentBackgroundColor = this.lighterBackgroundColor;
  }

  onMouseLeave() {
    this.currentBackgroundColor = this.backgroundColor;
  }
}
