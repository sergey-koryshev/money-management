import { User } from '@models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
  @Input()
  user: User;

  @Input()
  short: boolean;

  fullName: string;
  initials: string;
  avatarStyles: {[key: string]: string};

  ngOnInit() {
    this.initials = this.user.firstName[0] + this.user.secondName[0];
    this.fullName = `${this.user.firstName} ${this.user.secondName}`;
    const avatarBackgroundColor = this.getUniqueColor(this.user.id);
    const avatarForegroundColor = this.getForegroundColor(avatarBackgroundColor);
    this.avatarStyles = {
      'background-color': `${avatarBackgroundColor}80`,
      'color': avatarForegroundColor
    }
  }

  private getUniqueColor(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    let generatedColor = '#';

    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      generatedColor += `00${value.toString(16)}`.slice(-2);
    }

    return generatedColor;
  }

  private getForegroundColor(color: string) {
    const hexColor = this.parseHexColor(color);

    if (hexColor === null) {
      console.error(`Avatar color ${color} cannot be parsed`);
      return '#ffffff'
    }

    return hexColor.r * 0.299 + hexColor.g * 0.587 + hexColor.b * 0.114 > 186
      ? '#000000'
      : '#ffffff';
  }

  private parseHexColor(color: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: result.length === 5 ? parseInt(result[4], 16) : null
        }
      : null;
  }
}
