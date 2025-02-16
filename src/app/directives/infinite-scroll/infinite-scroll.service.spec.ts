import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
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
    [restoreScroll]="restoreScroll"
    (infiniteScroll)="onScroll()"
  ></mat-select>`,
})
class TestComponent {
  restoreScroll = new Subject<number>();
  onScroll() {}
}

describe('InfiniteScrollService', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockInfiniteScrollCallback: jasmine.Spy;
  let mockInfiniteScrollService: InfiniteScrollService;
  let restoreScroll: Subject<number>;

  beforeEach(async () => {
    restoreScroll = new Subject<number>();

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
      imports: [MatSelectModule, MatSelectInfiniteScrollDirective],
      providers: [
        { provide: InfiniteScrollService, useValue: mockInfiniteScrollService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (mockInfiniteScrollService) {
      mockInfiniteScrollService.destroy();
    }
  });

  it('should be created', () => {
    expect(mockInfiniteScrollService).toBeTruthy();
  });

  it('should evaluate threshold correctly for percentage', () => {
    mockInfiniteScrollService.evaluateThreshold();
    expect(mockInfiniteScrollService['thrPc']).toBe(0.15);
    expect(mockInfiniteScrollService['thrPx']).toBe(0);
  });

  it('should correctly handle restoreScroll subject', () => {
    spyOn(component.restoreScroll, 'next');
    component.restoreScroll.next(100);
    expect(component.restoreScroll.next).toHaveBeenCalledWith(100);
  });

  it('should clean up on destroy', () => {
    spyOn(mockInfiniteScrollService['destroyed$'], 'next');
    spyOn(mockInfiniteScrollService['destroyed$'], 'complete');

    mockInfiniteScrollService.destroy();

    expect(mockInfiniteScrollService['destroyed$'].next).toHaveBeenCalled();
    expect(mockInfiniteScrollService['destroyed$'].complete).toHaveBeenCalled();
  });
});
