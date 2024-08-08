import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContextMenuTriggerDirective } from './context-menu.directive';

@Component({
  template: `
    <div
      [contextMenuTriggerFor]="menu"
      [contextMenuTriggerData]="{ row: { id: '1' }, index: 0 }"
    ></div>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item 1</button>
      <button mat-menu-item>Item 2</button>
    </mat-menu>
  `,
})
class TestComponent {
  @ViewChild(ContextMenuTriggerDirective)
  contextMenuTriggerDirective!: ContextMenuTriggerDirective;

  @ViewChild('menu')
  menuPanel!: MatMenuPanel;
}

describe('ContextMenuTriggerDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        NoopAnimationsModule,
        ContextMenuTriggerDirective,
      ],
      declarations: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance of ContextMenuTriggerDirective', () => {
    expect(component.contextMenuTriggerDirective).toBeTruthy();
  });

  it('should open the menu on contextmenu event', () => {
    const div = fixture.debugElement.query(By.css('div'));
    const event = new MouseEvent('contextmenu', {
      clientX: 100,
      clientY: 100,
      bubbles: true,
      cancelable: true,
    });

    div.nativeElement.dispatchEvent(event);
    fixture.detectChanges();

    const menuPanel = document.querySelector(
      '.mat-mdc-menu-panel'
    ) as HTMLElement;
    expect(menuPanel).toBeTruthy();
  });

  it('should close the menu', () => {
    const div = fixture.debugElement.query(By.css('div'));
    const event = new MouseEvent('contextmenu', {
      clientX: 100,
      clientY: 100,
      bubbles: true,
      cancelable: true,
    });

    div.nativeElement.dispatchEvent(event);
    fixture.detectChanges();

    component.contextMenuTriggerDirective.closeMenu();
    fixture.detectChanges();

    const menuPanel = document.querySelector('.mat-menu-panel');
    expect(menuPanel).toBeNull();
  });
});
