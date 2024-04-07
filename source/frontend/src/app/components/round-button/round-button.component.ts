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

  currentBackgroundColor: string;
  lighterBackgroundColor: string;

  ngOnInit(): void {
    this.currentBackgroundColor = this.backgroundColor;
    this.lighterBackgroundColor = shade(this.backgroundColor, -20);
  }

  onMouseOver() {
    this.currentBackgroundColor = this.lighterBackgroundColor;
  }

  onMouseLeave() {
    this.currentBackgroundColor = this.backgroundColor;
  }
}
