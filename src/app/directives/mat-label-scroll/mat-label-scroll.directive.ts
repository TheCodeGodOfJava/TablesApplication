import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appMatLabelScroll]',
})
export class MatLabelScrollDirective implements AfterViewInit {
  private styleElement: HTMLStyleElement = this.renderer.createElement('style');
  private topPositionClassName: string = 'label-top-position';
  private labelElement!: HTMLElement;

  indent: number = 16;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.labelElement = this.el.nativeElement.querySelector(
      '.mdc-floating-label--float-above'
    );
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.startMarquee();
  }

  @HostListener('mouseleave', ['$event'])
  @HostListener('keydown', ['$event'])
  @HostListener('mousedown', ['$event'])
  handleEvent() {
    if (!this.labelElement) {
      return;
    }
    this.renderer.removeClass(this.labelElement, this.topPositionClassName);
    this.renderer.removeChild(this.labelElement, this.styleElement);
  }

  @HostListener('keyup', ['$event'])
  @HostListener('mouseup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.startMarquee();
  }

  startMarquee() {
    const labelWidth = this.labelElement.getBoundingClientRect().width;
    const labelWrapperWidth =
      this.el.nativeElement.getBoundingClientRect().width;

    if (labelWrapperWidth > labelWidth) {
      return;
    }

    const transition = labelWrapperWidth - labelWidth;
    const standardTime = 1.1;
    const transitionDuration = standardTime * (labelWidth / labelWrapperWidth);
    let styles = `
    transition: transform ${transitionDuration}s ease-in !important;
    transition-delay: 0.1s !important;
    transform: translate(${
      transition - this.indent
    }px,-106%) scale(0.75) !important;
    `;
    let selectElNecessaryStyles =
      'text-overflow: clip !important; overflow: visible !important;';
    styles += selectElNecessaryStyles;

    this.styleElement.textContent = `.${this.topPositionClassName} { ${styles} }`;
    this.renderer.appendChild(this.el.nativeElement, this.styleElement);
    this.renderer.addClass(this.labelElement, this.topPositionClassName);
  }
}
