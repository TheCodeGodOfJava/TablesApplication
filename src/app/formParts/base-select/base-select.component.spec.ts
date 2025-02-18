import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FilterService } from '../../services/filter/filter.service';
import { BaseSelectComponent } from './base-select.component';

describe('BaseSelectComponent', () => {
  let component: BaseSelectComponent;
  let fixture: ComponentFixture<BaseSelectComponent>;
  let mockFilterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    mockFilterService = jasmine.createSpyObj('FilterService', [
      'getDataForFilter',
      'getParentSelectValue',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        NgxMatSelectSearchModule,
        NoopAnimationsModule,
        BaseSelectComponent,
      ],
      providers: [{ provide: FilterService, useValue: mockFilterService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseSelectComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      testAlias: new FormControl(''),
      testAliasSelectSearch: new FormControl(''),
    });
    component.alias = 'testAlias';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize options on initSelect', (done) => {
    component.ngAfterViewInit();
    setTimeout(() => {
      expect(BaseSelectComponent.optionsMap.has('testAlias')).toBeTrue();
      done();
    }, 0);
  });

  it('should reset and load options', () => {
    const data = component.resetAndLoadOptions('testAlias', 'testTerm');
    expect(data.currentTerm).toBe('testTerm');
    expect(BaseSelectComponent.optionsMap.get('testAlias')).toBeDefined();
  });

  it('should clear selection when onClear is called', () => {
    component.formGroup.get('testAlias')?.setValue('someValue');
    component.onClear(new Event('click'));
    expect(component.formGroup.get('testAlias')?.value).toBeNull();
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component.subscriptions$, 'next').and.callThrough();
    spyOn(component.subscriptions$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component.subscriptions$.next).toHaveBeenCalled();
    expect(component.subscriptions$.complete).toHaveBeenCalled();
  });
});
