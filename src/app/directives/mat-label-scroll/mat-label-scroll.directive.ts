import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMatLabelScroll]',
  standalone: true,
})
export class MatLabelScrollDirective {
  styleElement: HTMLStyleElement = this.renderer.createElement('style');
  mainPositionClassName: string = 'label-main-position';
  topPositionClassName: string = 'label-top-position';
  matLabelElement: HTMLElement = {} as HTMLElement;
  labelElement: HTMLElement = {} as HTMLElement;
  indent: number = 16;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseleave', ['$event'])
  @HostListener('input', ['$event'])
  @HostListener('click', ['$event'])
  handleEvent() {
    this.clearClasses();
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.labelElement = this.el.nativeElement.querySelector('label');
    this.matLabelElement = this.el.nativeElement.querySelector('mat-label');

    if (!this.labelElement) {
      return;
    }

    let isLabelTopPosition = this.labelElement.classList.contains(
      'mdc-floating-label--float-above'
    );
    let labelWrapperWidth = this.el.nativeElement.getBoundingClientRect().width;
    let isLabelWider = this.getCorrectLabelWidth() > labelWrapperWidth;

    if (!isLabelWider) {
      return;
    }

    let widthDifference = this.getCorrectLabelWidth() - labelWrapperWidth;

    isLabelTopPosition
      ? this.generateLabelTopPositionClass(widthDifference)
      : this.generateLabelMainPositionClass(widthDifference);
  }

  generateClass(className: string, styles: string) {
    this.styleElement.textContent = `.${className} { ${styles} }`;
    this.renderer.appendChild(this.el.nativeElement, this.styleElement);
    this.renderer.addClass(this.labelElement, className);
  }

  generateLabelMainPositionClass(transition: number) {
    let styles = `animation: marquee 10s linear infinite !important; transition-delay: 0.1s !important; transform: translate(-${
      transition + this.indent * 3
    }px, -50%) !important;`;
    let selectElNecessaryStyles =
      'text-overflow: clip !important; overflow: visible !important; max-width:none !important; padding-right: 10px !important';
    styles += selectElNecessaryStyles;

    this.generateClass(this.mainPositionClassName, styles);
  }

  generateLabelTopPositionClass(transition: number) {
    let styles = `transition: transform 2s ease-in-out !important; transition-delay: 0.1s !important; transform: translate(-${
      transition / 0.75 + this.indent * 2
    }px,-106%) scale(0.75) !important;`;
    let selectElNecessaryStyles =
      'text-overflow: clip !important; overflow: visible !important; max-width:none !important;';
    styles += selectElNecessaryStyles;

    this.generateClass(this.topPositionClassName, styles);
  }

  getCorrectLabelWidth() {
    let matLabelWidth = this.matLabelElement.getBoundingClientRect().width;
    let labelWidth = this.labelElement.getBoundingClientRect().width;
    return matLabelWidth > labelWidth ? matLabelWidth : labelWidth;
  }

  clearClasses() {
    if (!this.labelElement) {
      return;
    }

    this.renderer.removeClass(this.labelElement, this.topPositionClassName);
    this.renderer.removeClass(this.labelElement, this.mainPositionClassName);
    this.renderer.removeChild(this.labelElement, this.styleElement);
  }
}
