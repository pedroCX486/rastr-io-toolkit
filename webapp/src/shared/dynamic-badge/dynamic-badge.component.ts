import { Component, Input } from '@angular/core';

@Component({
  selector: 'dynamic-badge',
  templateUrl: './dynamic-badge.component.html',
  styleUrls: ['./dynamic-badge.component.scss']
})

export class DynamicBadgeComponent {

  @Input() badgeType;
  @Input() mainText;
  @Input() infoText;

  // Color - Main Text
  private mainTextColor = 'black-text';

  get colorMainText(): string {
    return this.mainTextColor;
  }

  @Input() set colorMainText(value: string) {
    if (value.includes('dark')) {
      this.mainTextColor = 'dark-text';
    } else if (value.includes('black')) {
      this.mainTextColor = 'black-text';
    } else {
      this.mainTextColor = 'light-text';
    }
  }

  // Background - Info Text
  private infoTextBackground = 'light-background';

  get backgroundInfoText(): string {
    return this.infoTextBackground;
  }

  @Input() set backgroundInfoText(value: string) {
    if (value.includes('dark')) {
      this.infoTextBackground = 'dark-background';
    } else if (value.includes('black')) {
      this.infoTextBackground = 'black-background';
    } else {
      this.infoTextBackground = 'light-background';
    }
  }
}
