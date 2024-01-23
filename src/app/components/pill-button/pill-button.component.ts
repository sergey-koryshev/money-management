import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Shade } from '@app/helpers/colors.helper';

@Component({
  selector: 'app-pill-button',
  templateUrl: './pill-button.component.html',
  styleUrls: ['./pill-button.component.scss']
})
export class PillButtonComponent implements OnInit {

  @Input()
  backgroundColor: string;

  currentBackgroundColor: string;
  lighterBackgroundColor: string;
  textColor: string;

  ngOnInit(): void {
    this.currentBackgroundColor = this.backgroundColor;
    this.lighterBackgroundColor = Shade(this.backgroundColor, -20);
    this.textColor = Shade(this.backgroundColor, -100);
  }

  onMouseOver() {
    this.currentBackgroundColor = this.lighterBackgroundColor;
  }

  onMouseLeave() {
    this.currentBackgroundColor = this.backgroundColor;
  }
}
