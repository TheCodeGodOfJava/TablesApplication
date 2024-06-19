import { Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appMatLabelScroll]',
  standalone: true,
})
export class MatLabelScrollDirective implements AfterViewInit, OnDestroy {
  private styleElement: HTMLStyleElement;
  private labelElement!: HTMLElement;
  private mutationObserver!: MutationObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.styleElement = this.renderer.createElement('style');
    this.initAnimationStyles();
  }

  ngAfterViewInit() {
    this.labelElement = this.el.nativeElement.querySelector('label');
    if (this.labelElement) {
      this.startMarquee();

      this.mutationObserver = new MutationObserver(() => {
        this.handleMutation();
      });
      this.mutationObserver.observe(this.labelElement, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  ngOnDestroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  initAnimationStyles() {
    const styles = `
      @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }

      .marquee {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        animation: marquee 10s linear infinite;
      }
    `;
    this.styleElement.textContent = styles;
    this.renderer.appendChild(document.head, this.styleElement);
  }

  startMarquee() {
    this.renderer.addClass(this.labelElement, 'marquee');
  }

  handleMutation() {
    this.renderer.removeClass(this.labelElement, 'marquee');
    void this.labelElement.offsetWidth; // Trigger reflow
    this.renderer.addClass(this.labelElement, 'marquee');
  }
}
