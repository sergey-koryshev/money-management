import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { shade } from '@app/helpers/colors.helper';

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
    this.lighterBackgroundColor = shade(this.backgroundColor, -20);
    this.textColor = shade(this.backgroundColor, -100);
  }

  onMouseOver() {
    this.currentBackgroundColor = this.lighterBackgroundColor;
  }

  onMouseLeave() {
    this.currentBackgroundColor = this.backgroundColor;
  }
}
