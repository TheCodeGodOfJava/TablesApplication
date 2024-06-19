import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { MatLabelScrollDirective } from './mat-label-scroll.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  template: `
    <form [formGroup]="formGroup">
      <mat-form-field>
        <mat-label class="mdc-floating-label--float-above" appMatLabelScroll>
          Label Text
        </mat-label>
        <input matInput formControlName="inputControl" />
      </mat-form-field>
    </form>
  `,
})
class TestComponent {
  formGroup = new FormGroup({
    inputControl: new FormControl(''),
  });
}

describe('MatLabelScrollDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatLabelScrollDirective,
        BrowserAnimationsModule
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = new MatLabelScrollDirective(
      fixture.elementRef,
      fixture.debugElement.injector.get(Renderer2)
    );
    expect(directive).toBeTruthy();
  });



  it('should remove marquee on mouseleave', () => {
    const labelElement = fixture.debugElement.query(
      By.directive(MatLabelScrollDirective)
    ).nativeElement;
    const directive = new MatLabelScrollDirective(
      fixture.elementRef,
      fixture.debugElement.injector.get(Renderer2)
    );
    directive.ngAfterViewInit();
    directive['labelElement'] = labelElement;

    const eventEnter = new Event('mouseenter');
    labelElement.dispatchEvent(eventEnter);
    fixture.detectChanges();

    const eventLeave = new Event('mouseleave');
    labelElement.dispatchEvent(eventLeave);
    fixture.detectChanges();

    expect(
      labelElement.classList.contains(directive['topPositionClassName'])
    ).toBeFalse();
  });


  it('should remove marquee on mousedown', () => {
    const labelElement = fixture.debugElement.query(
      By.directive(MatLabelScrollDirective)
    ).nativeElement;
    const directive = new MatLabelScrollDirective(
      fixture.elementRef,
      fixture.debugElement.injector.get(Renderer2)
    );
    directive.ngAfterViewInit();
    directive['labelElement'] = labelElement;

    const eventEnter = new Event('mouseenter');
    labelElement.dispatchEvent(eventEnter);
    fixture.detectChanges();

    const eventDown = new Event('mousedown');
    labelElement.dispatchEvent(eventDown);
    fixture.detectChanges();

    expect(
      labelElement.classList.contains(directive['topPositionClassName'])
    ).toBeFalse();
  });
});
