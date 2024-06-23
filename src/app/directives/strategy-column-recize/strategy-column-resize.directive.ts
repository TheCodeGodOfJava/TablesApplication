import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { Subscription, merge, startWith, tap, withLatestFrom } from 'rxjs';
import { GenericDataSource } from '../../components/data-tables/components/abstract/genericDataSource';
import { AppColumn } from '../../components/data-tables/interfaces/appColumn';

@Directive({
  selector: '[strategyResize]',
  standalone: true,
})
export class StrategyResizeDirective<T>
  implements AfterViewInit, OnChanges, OnDestroy
{
  private tableRef!: HTMLTableElement;
  @Input() columns!: AppColumn<T>[];
  @Input() loadedWidths: boolean = false;
  @Input() dataSource!: GenericDataSource<T>;
  @Input() performMassResize: boolean = false;

  pressed: boolean = false;
  currentResizeIndex!: number;
  startX!: number;
  isResizingRight!: boolean;
  resizableMouseMove!: () => void;
  resizableMouseUp!: () => void;
  chainedColumnIndex = -1;
  firstChained: number = 0;
  secondChained: number = 0;
  minWidth: number = 45;
  subscription: Subscription = new Subscription();
  initialLoadComplete: boolean = false;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnChanges(sc: SimpleChanges) {
    if (
      this.initialLoadComplete &&
      (sc['columns'] || sc['performMassResize'])
    ) {
      setTimeout(() => this.massResize(), 0);
    }
  }

  ngAfterViewInit(): void {
    this.tableRef = this.el.nativeElement.querySelector('table');

    this.subscription = merge(
      this.dataSource.loadingSubject,
      this.dataSource.modelSubject
    )
      .pipe(
        withLatestFrom(
          this.dataSource.loadingSubject.pipe(startWith(null)),
          this.dataSource.modelSubject.pipe(startWith(null))
        ),
        tap(([, loading]) => {
          setTimeout(() => {
            if (!loading) {
              if (!this.initialLoadComplete && !this.loadedWidths) {
                this.calculateDefaultWidth();
              }
              this.setTableWidth();
              this.initialLoadComplete = true;
            }
          }, 0);
        })
      )
      .subscribe();
  }

  private calculateDefaultWidth() {
    const screenWidth = window.innerWidth;
    const width = (screenWidth - this.minWidth) / this.columns.length;
    this.columns.forEach((c) => (c.width = width));
  }

  public massResize() {
    this.calculateDefaultWidth();
    this.setTableWidth();
  }

  private setTableWidth() {
    this.columns.forEach((column, i) =>
      this.setColumnWidth(column.alias, column.width || 0, i)
    );
  }

  onResizeColumn(
    event: MouseEvent,
    index: number,
    leftHandler: boolean = false
  ) {
    this.checkResizing(event, index);
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = event.pageX;
    this.chainedColumnIndex = this.isResizingRight ? index + 1 : index - 1;
    this.firstChained =
      this.columns[leftHandler ? index - 1 : index].width || 0;
    this.secondChained = this.columns[this.chainedColumnIndex].width || 0;
    event.preventDefault();
    this.mouseMove(index, leftHandler);
  }

  private checkResizing(event: MouseEvent, index: number) {
    const cellData = this.getCellData(index);
    const movedLessThenHalfColumnWidth =
      Math.abs(event.pageX - cellData.right) < cellData.width / 2;
    const notLastColumnIndex = index !== this.columns.length - 1;
    this.isResizingRight =
      index === 0 || (movedLessThenHalfColumnWidth && notLastColumnIndex)
        ? true
        : false;
  }

  private getCellData(index: number): DOMRect {
    const headerRow = this.tableRef.children[0].children[0];
    const cell = headerRow.children[index];
    return cell.getBoundingClientRect();
  }

  private mouseMove(index: number, leftHandler: boolean = false) {
    this.resizableMouseMove = this.renderer.listen(
      'document',
      'mousemove',
      (event) => {
        if (this.pressed && event.buttons) {
          const dx = this.isResizingRight
            ? event.pageX - this.startX
            : this.startX - event.pageX;
          if (dx !== 0 && this.currentResizeIndex === index) {
            let currColumn;
            let currWidth;
            if (leftHandler) {
              currColumn = this.columns[index - 1];
              currWidth = this.firstChained - dx;
              const tableWidth = this.columns.reduce(
                (acc, c) => acc + (c.width || 0),
                0
              );
              const screenWidth = window.innerWidth;

              if (currWidth > this.minWidth && tableWidth > screenWidth - 20) {
                console.log(currWidth);
                currColumn.width = currWidth;
                this.setTableWidth();
              }
            } else {
              currWidth = this.firstChained + dx;
              currColumn = this.columns[index];
              const chainedColumn = this.columns[this.chainedColumnIndex];
              currColumn.width = currWidth;
              const sumChainedColumns = this.firstChained + this.secondChained;
              if (currWidth > this.minWidth) {
                const chainedWidth = sumChainedColumns - currWidth;
                if (chainedWidth > this.minWidth) {
                  chainedColumn.width = chainedWidth;
                  this.setTableWidth();
                }
              }
              if (currWidth > sumChainedColumns) {
                this.setTableWidth();
              }
            }
          }
        }
      }
    );
    this.resizableMouseUp = this.renderer.listen('document', 'mouseup', () => {
      if (this.pressed) {
        this.pressed = false;
        this.currentResizeIndex = -1;
        this.resizableMouseMove();
        this.resizableMouseUp();
      }
    });
  }

  private setColumnWidth(alias: string, width: number, index?: number) {
    if (!this.tableRef || index === undefined) {
      return;
    }
    const columnEls: HTMLElement[] = Array.from(
      this.tableRef.querySelectorAll('.mat-column-' + alias)
    );

    columnEls.forEach((el: HTMLElement) => {
      el.style.minWidth = el.style.maxWidth = el.style.width = width + 'px';
    });

    columnEls.forEach((el: HTMLElement) => {
      if (el.tagName === 'TD') {
        el.querySelectorAll('.resizer').forEach((resizer) => {
          this.renderer.removeChild(el, resizer);
        });
        this.createResizerSpan(el, index);
      }
    });
  }

  private createResizerSpan(el: HTMLElement, index: number) {
    if (el.querySelector('.bar')) {
      return;
    }

    const rightHandleBar = this.renderer.createElement('div');
    this.renderer.addClass(rightHandleBar, 'bar');
    this.renderer.addClass(rightHandleBar, 'right-resize-holder');
    this.renderer.addClass(rightHandleBar, 'gradient-background');
    this.renderer.insertBefore(el, rightHandleBar, el.firstChild);

    this.renderer.listen(rightHandleBar, 'mousedown', (event) =>
      this.onResizeColumn(event, index)
    );

    const leftHandleBar = this.renderer.createElement('div');
    this.renderer.addClass(leftHandleBar, 'bar');
    this.renderer.addClass(leftHandleBar, 'left-resize-holder');
    this.renderer.addClass(leftHandleBar, 'gradient-background');
    this.renderer.insertBefore(el, leftHandleBar, el.firstChild);

    this.renderer.listen(leftHandleBar, 'mousedown', (event) =>
      this.onResizeColumn(event, index, true)
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setTableWidth();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
