import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { InfiniteScrollService } from './infinite-scroll.service';
import { MatSelectInfiniteScrollDirective } from './mat-select-infinite-scroll.directive';

const mockNgZone = {
  runOutsideAngular: (fn: () => void) => fn(),
  run: (fn: () => void) => fn(),
} as unknown as NgZone;

@Component({
  template: `<mat-select
    iScroll
    [threshold]="'10%'"
    [restoreScroll]="restoreScroll"
    (infiniteScroll)="onScroll()"
  ></mat-select>`,
})
class TestComponent {
  restoreScroll = new Subject<number>();
  @ViewChild(MatSelectInfiniteScrollDirective)
  directive!: MatSelectInfiniteScrollDirective;
  onScroll() {}
}

describe('MatSelectInfiniteScrollDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: MatSelectInfiniteScrollDirective;
  let mockMatSelect: jasmine.SpyObj<MatSelect>;
  let mockInfiniteScrollCallback: jasmine.Spy;
  let mockInfiniteScrollService: InfiniteScrollService;
  let openedChangeSubject: Subject<boolean>;
  let restoreScroll: Subject<number>;
  let mockPanel: Element;

  const mockElementRef = new ElementRef(document.createElement('div'));

  beforeEach(async () => {
    restoreScroll = new Subject<number>();

    mockPanel = document.createElement('div');

    Object.defineProperty(mockPanel, 'scrollHeight', {
      value: 500,
      writable: true,
    });

    Object.defineProperty(mockPanel, 'clientHeight', {
      value: 200,
      writable: true,
    });

    openedChangeSubject = new Subject<boolean>();

    mockMatSelect = jasmine.createSpyObj<MatSelect>('MatSelect', [
      'open',
      'close',
      'toggle',
      'setDisabledState',
    ]);

    Object.defineProperty(mockMatSelect, 'panel', {
      get: () => mockElementRef.nativeElement,
    });

    Object.defineProperty(mockMatSelect, 'openedChange', {
      get: () => openedChangeSubject.asObservable(),
    });

    mockInfiniteScrollService = new InfiniteScrollService(mockNgZone);
    spyOn(mockInfiniteScrollService, 'initialize').and.callThrough();
    spyOn(
      mockInfiniteScrollService,
      'registerScrollListener'
    ).and.callThrough();
    spyOn(mockInfiniteScrollService, 'destroy').and.callThrough();
    mockInfiniteScrollCallback = jasmine.createSpy('infiniteScrollCallback');

    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [MatSelectInfiniteScrollDirective],
      providers: [
        { provide: MatSelect, useValue: mockMatSelect },
        { provide: InfiniteScrollService, useValue: mockInfiniteScrollService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    directive = component.directive;
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should correctly handle restoreScroll subject', () => {
    spyOn(component.restoreScroll, 'next');

    // Emit restoreScroll value
    component.restoreScroll.next(100);

    expect(component.restoreScroll.next).toHaveBeenCalledWith(100);
  });
});
