import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import 'preline/preline';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('jolie');
  isMenuOpen = false;
  private hasUnlockedAudio = false;


  currentSong = signal('');
  isEasterEgg = signal(false);

  public audio = new Audio();
  private i = 0;

  isCollapsed = signal(false);
  isMusicOn = signal(false);

  private currentPlaylist: string[] = [
    'songs/do flowers bloom where you walk_.mp3',
    'songs/forward.mp3',
    'songs/and still, the sky waited.mp3',
    'songs/sora.wav - best part (ft. chevy).mp3',
    'songs/Bruno Major - Nothing (Lyric & Chord Video).mp3',

    'songs/Watashino Uso.mp3',
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menu = document.getElementById('options-menu');
    const button = document.getElementById('options-menu-button');

    if (
      !menu?.contains(event.target as Node) &&
      !button?.contains(event.target as Node)
    ) {
      this.isMenuOpen = false;
    }
  }

  showPlayHint = signal(false);
  private firstClickListenerAdded = false;

ngOnInit(): void {
  this.audio.preload = 'auto';
  this.audio.loop = false;
  this.audio.volume = 0.3;

  this.setPlaylist(this.currentPlaylist);

  this.audio.addEventListener('ended', () => {
    this.next();
  });

  // Unlock audio on FIRST user interaction anywhere
  document.addEventListener(
    'click',
    () => {
      if (!this.hasUnlockedAudio) {
        this.unlockMusic();
      }
    },
    { once: true }
  );

  this.showWelcomePopup();
}


  private handleFirstClick = () => {
    // Just unlock audio; do NOT restart the song
    this.audio.play().then(() => {
      this.isMusicOn.set(true);
    });
  };

  private setPlaylist(list: string[]) {
    if (!list.length) return;
    this.currentPlaylist = list;
    this.load(this.i);
  }

  private load(index: number) {
    if (!this.currentPlaylist?.length) return;

    this.i =
      ((index % this.currentPlaylist.length) + this.currentPlaylist.length) %
      this.currentPlaylist.length;

    this.audio.src = this.currentPlaylist[this.i]; // ONLY SET SOURCE

    const raw = this.currentPlaylist[this.i].split('/').pop() ?? '';
    this.currentSong.set(raw.replace(/\.[^/.]+$/, ''));
  }

  private next() {
    if (!this.currentPlaylist.length) return;
    this.load(this.i + 1);
    this.play();
  }

  private async play() {
    try {
      await this.audio.play();
    } catch {
      this.showPlayHint.set(true);
    }
  }

  public pause() {
    this.audio.pause();
    this.isMusicOn.set(false);
  }

  public resume() {
    this.play();
    this.isMusicOn.set(true);
  }

  public toggleMusic() {
    if (this.isMusicOn()) {
      this.pause();
    } else {
      this.resume();
    }
  }

  showWelcomePopup() {
    Swal.fire({
      title: 'heeellooo, I AM BACK ฅᨐฅ',
      width: '32rem',
      padding: '1.5rem',
      background: 'rgba(0,0,0,1)',
      color: '#ffffffff',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#444141ff',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((res) => {
        if (res.isConfirmed) {
        // User DISMISSED popup 1 (close, outside click, esc) -> play music
        this.unlockMusic();
      }
    });
  }



private unlockMusic() {
  this.audio
    .play()
    .then(() => {
      this.isMusicOn.set(true);
      this.hasUnlockedAudio = true;
    })
    .catch(() => {
      // autoplay still blocked until user interacts again
    });
}

}


