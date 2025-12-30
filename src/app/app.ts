import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('jolie');

  isMenuOpen = false;
  isMusicOn = signal(false);
  isCollapsed = signal(false);
  isEasterEgg = signal(false);

  private hasUnlockedAudio = false;

  public audio = new Audio();
  private index = 0;

  currentSong = signal('');

  private playlist: string[] = [
    'songs/banana milk.mp3',
    'songs/fragility.mp3',
    'songs/willow.mp3',
    'songs/Chainsaw Man The Movie_ Reze Arc  OST -  04 - first glance.mp3',
    'songs/Watashino Uso.mp3',
    'songs/between words.mp3',
    'songs/and still, the sky waited.mp3',
  ];

  ngOnInit() {
    this.audio.preload = 'auto';
    this.audio.volume = 0.3;
    this.audio.loop = false;

    this.setPlaylist(this.playlist);

    this.audio.addEventListener('ended', () => {
      this.next();
    });

    this.showWelcomePopup();
  }

  /* ===============================
     GLOBAL USER INTERACTION UNLOCK
     =============================== */
  @HostListener('document:click')
  handleFirstInteraction() {
    if (!this.hasUnlockedAudio) {
      this.unlockMusic();
    }
  }

  /* ===============================
     AUDIO CORE
     =============================== */

  private setPlaylist(list: string[]) {
    if (!list.length) return;
    this.playlist = list;
    this.load(0);
  }

  private load(index: number) {
    this.index = (index + this.playlist.length) % this.playlist.length;

    this.audio.src = this.playlist[this.index];

    const name = this.playlist[this.index].split('/').pop() ?? '';
    this.currentSong.set(name.replace(/\.[^/.]+$/, ''));
  }

  private async play() {
    try {
      await this.audio.play();
      this.isMusicOn.set(true);
    } catch {
      // browser still blocking until gesture
    }
  }

  private next() {
    this.load(this.index + 1);
    this.play();
  }
  lowerMusicVolume() {
  this.audio.volume = 0.08;
}

restoreMusicVolume() {
  this.audio.volume = 0.3;
}


  pause() {
    this.audio.pause();
    this.isMusicOn.set(false);
  }

  resume() {
    this.unlockMusic();
  }

  toggleMusic() {
    this.isMusicOn() ? this.pause() : this.resume();
  }

  private unlockMusic() {
    if (this.hasUnlockedAudio) return;

    this.audio
      .play()
      .then(() => {
        this.hasUnlockedAudio = true;
        this.isMusicOn.set(true);
      })
      .catch(() => {});
  }

  /* ===============================
     POPUP
     =============================== */
onRouteActivate(component: any) {
  // only hook homepage
  if (component?.videoPlay && component?.videoPause) {
    component.videoPlay.subscribe(() => this.onVideoPlay());
    component.videoPause.subscribe(() => this.onVideoPause());
  }
}

onVideoPlay() {
  this.audio.pause();
  this.isMusicOn.set(false);
}

onVideoPause() {
  this.unlockMusic();
}

  showWelcomePopup() {
    Swal.fire({
      title: 'heeellooo, I AM BACK ฅᨐฅ',
      width: '32rem',
      padding: '1.5rem',
      background: 'rgba(0,0,0,1)',
      color: '#ffffff',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#444141',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then(() => {
      this.unlockMusic();
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
