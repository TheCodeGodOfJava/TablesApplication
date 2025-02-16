import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfiniteScrollService } from './infinite-scroll.service';

const SELECT_ITEM_HEIGHT_EM = 3;

@Directive({
  standalone: true,
  selector: '[iScroll]',
  providers: [InfiniteScrollService],
})
export class MatSelectInfiniteScrollDirective
  implements OnDestroy, AfterViewInit
{
  @Input() threshold: string = '15%';
  @Input() debounceTime: number = 150;
  @Output() infiniteScroll = new EventEmitter<void>();

  private destroyed$ = new Subject<boolean>();

  constructor(
    protected matSelect: MatSelect,
    private infiniteScrollService: InfiniteScrollService
  ) {}

  ngAfterViewInit() {
    this.matSelect.openedChange
      .pipe(takeUntil(this.destroyed$))
      .subscribe((opened) => {
        if (opened) {
          const panel = this.matSelect.panel.nativeElement;
          const selectItemHeightPx = this.getSelectItemHeightPx(panel);
          this.infiniteScrollService.initialize(panel, selectItemHeightPx, {
            threshold: this.threshold,
            debounceTime: this.debounceTime,
          });

          this.infiniteScrollService.registerScrollListener(() =>
            this.infiniteScroll.emit()
          );
        }
      });
  }

  getSelectItemHeightPx(panel: Element): number {
    return parseFloat(getComputedStyle(panel).fontSize) * SELECT_ITEM_HEIGHT_EM;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    this.infiniteScrollService.destroy();
  }
}
