import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { MatMenuPanel, MatMenuTrigger } from '@angular/material/menu';
import { Id } from '../../models/id';

@Directive({
  standalone: true,
  selector: '[contextMenuTriggerFor]',
})
export class ContextMenuTriggerDirective extends MatMenuTrigger implements OnInit {
  private readonly anchorElement = document.createElement('div');

  @Input('contextMenuTriggerFor')
  public get contextMenuTriggerFor() {
    return this.menu;
  }
  public set contextMenuTriggerFor(menu: MatMenuPanel | null) {
    this.menu = menu;
  }

  @Input('contextMenuTriggerData')
  public get contextMenuData() {
    return this.menuData;
  }

  public set contextMenuData(menuData: { row: Id, index: number }) {
    this.menuData = menuData;
  }

  public ngOnInit(): void {
    this.anchorElement.style.position = 'fixed';
    this.anchorElement.style.width = '0px';
    this.anchorElement.style.height = '0px';
    this.anchorElement.style.visibility = 'hidden';
    /* eslint-disable */
    (this as any)._element = new ElementRef(this.anchorElement);
    /* eslint-enable */
  }

  public override _handleClick() {}

  public override openMenu() {
    document.body.appendChild(this.anchorElement);
    super.openMenu();
  }

  public override closeMenu() {
    this.anchorElement.remove();
    super.closeMenu();
  }

  @HostListener('contextmenu', ['$event'])
  public handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.anchorElement.style.top = `${event.clientY}px`;
    this.anchorElement.style.left = `${event.clientX}px`;
    super._handleClick(event);
  }
}
