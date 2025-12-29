import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

 isShrunk = false;
  private lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onScroll() {
    const current = window.scrollY;

    if (current > this.lastScrollTop && current > 20) {
      // scrolling down
      this.isShrunk = true;
    } else {
      // scrolling up
      this.isShrunk = false;
    }

    this.lastScrollTop = current <= 0 ? 0 : current;
  }
}
