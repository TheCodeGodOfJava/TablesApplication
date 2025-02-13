import { Injectable, NgZone } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InfiniteScrollService {
  private threshold = '15%';
  private debounceTime = 150;
  private thrPx = 0;
  private thrPc = 0;
  private destroyed$ = new Subject<void>();
  private restoredScrollDistance: number = 0;
  private selectItemHeightPx!: number;
  private panel!: Element;

  constructor(private ngZone: NgZone) {}

  initialize(
    panel: Element,
    selectItemHeightPx: number,
    config: {
      threshold: string;
      debounceTime: number;
      restoreScroll: Subject<number>;
    }
  ) {
    this.threshold = config.threshold;
    this.debounceTime = config.debounceTime;

    this.panel = panel;
    this.selectItemHeightPx = selectItemHeightPx;
    this.evaluateThreshold();
    config.restoreScroll.pipe(takeUntil(this.destroyed$)).subscribe((count) => {
      if (this.panel) {
        setTimeout(() => {
          this.panel.scrollTop =
            this.restoredScrollDistance - count * this.selectItemHeightPx;
        }, 50);
      }
    });
  }

  evaluateThreshold() {
    if (this.threshold.lastIndexOf('%') > -1) {
      this.thrPx = 0;
      this.thrPc = parseFloat(this.threshold) / 100;
    } else {
      this.thrPx = parseFloat(this.threshold);
      this.thrPc = 0;
    }
  }

  registerScrollListener(infiniteScrollCallback: () => void) {
    fromEvent(this.panel, 'scroll')
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(this.debounceTime),
        tap((event) => {
          this.handleScrollEvent(event, infiniteScrollCallback);
        })
      )
      .subscribe();
  }

  handleScrollEvent(event: any, infiniteScrollCallback: () => void) {
    this.ngZone.runOutsideAngular(() => {

      const countOfRenderedOptions = Math.round(
        this.panel.scrollHeight / this.selectItemHeightPx
      );
      const infiniteScrollDistance =
        this.selectItemHeightPx * countOfRenderedOptions;
      this.restoredScrollDistance = infiniteScrollDistance;
      const threshold =
        this.thrPc !== 0 ? infiniteScrollDistance * this.thrPc : this.thrPx;

      const scrolledDistance = this.panel.clientHeight + event.target.scrollTop;

      if (scrolledDistance + threshold >= infiniteScrollDistance) {
        this.ngZone.run(infiniteScrollCallback);
      }
    });
  }

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
