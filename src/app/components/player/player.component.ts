import { Component, OnInit, OnDestroy } from '@angular/core';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  public isPlaying: boolean = false;
  public isLoading: boolean = false;
  public currentSong: string = "Aguardando conexão...";
  public errorMessage: string | null = null;
  public volume: number = 70;

  private streamUrl: string = "https://s2.free-shoutcast.com/stream/18088";
  private streamPassword: string = "pilantra123";
  private howl: Howl | null = null;
  private metadataInterval: any;

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializePlayer(): void {
    if (this.howl) {
      this.howl.unload();
    }

    this.howl = new Howl({
      src: [this.streamUrl], // Removida autenticação na URL
      html5: true,
      format: ['mp3', 'aac'],
      volume: this.volume / 100,
      onplay: () => {
        this.isPlaying = true;
        this.isLoading = false;
        this.errorMessage = null;
        this.startMetadataUpdates();
      },
      onpause: () => {
        this.isPlaying = false;
        this.stopMetadataUpdates();
      },
      onstop: () => {
        this.isPlaying = false;
        this.stopMetadataUpdates();
      },
      onloaderror: (event: any, error: any) => {
        this.handleError('Erro ao carregar o stream: ' + error);
      },
      onplayerror: (event: any, error: any) => {
        this.handleError('Erro ao reproduzir: ' + error);
      },
      onend: () => {
        this.isPlaying = false;
        this.stopMetadataUpdates();
      }
    });
  }

  private startMetadataUpdates(): void {
    this.updateNowPlaying();
    this.metadataInterval = setInterval(() => {
      this.updateNowPlaying();
    }, 10000);
  }

  private stopMetadataUpdates(): void {
    if (this.metadataInterval) {
      clearInterval(this.metadataInterval);
    }
  }

  private updateNowPlaying(): void {
    this.currentSong = "Obtendo informações...";
    setTimeout(() => {
      this.currentSong = "Música Atual - Artista";
    }, 1000);
  }

  private handleError(message: string): void {
    console.error(message);
    this.errorMessage = "Erro na conexão com o stream";
    this.isPlaying = false;
    this.isLoading = false;
    this.retryConnection();
  }

  public togglePlay(): void {
    if (!this.howl) return;

    if (this.isPlaying) {
      this.howl.pause();
    } else {
      this.isLoading = true;
      this.errorMessage = null;
      this.howl.play();
    }
  }

  public changeVolume(): void {
    if (this.howl) {
      this.howl.volume(this.volume / 100);
    }
  }

  public retryConnection(): void {
    this.cleanup();
    setTimeout(() => {
      this.initializePlayer();
      if (!this.isPlaying) {
        this.togglePlay();
      }
    }, 5000);
  }

  private cleanup(): void {
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    this.stopMetadataUpdates();
  }
}
