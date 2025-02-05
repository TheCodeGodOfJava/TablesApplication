import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { TableFormOperations } from '../../../../data-tables/components/abstract/tableFormOperations';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { FormMatrix } from '../../../interfaces/formMatrix';

export class FormEnhancedOperations<T> extends TableFormOperations<T> {
  constructor(
    protected allFields: AppEntity<T>[],
    protected formName: string,
    public drawMatrix: FormMatrix<T>,
    protected override fb: FormBuilder,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    super(allFields, fb);
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    if (this.drawMatrix.tiles.size) {
      if (formControl && formControl.value.length) {
        const activePlaceHolders = formControl.value;
        const activeFormElements = [...this.drawMatrix.tiles.values()]
          .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
          .flat();
        this.enableFormElements(activePlaceHolders, activeFormElements);
        this.disableFormElement(activePlaceHolders, activeFormElements);

        this.toastrService.success('Form configuration successfully changed!');
      }
    } else {
      formControl?.reset();
      this.toastrService.error(
        'No form containers found! Please add at least one form container!'
      );
    }
    this.saveFormTemplate();
  };

  private enableFormElements(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    if (this.drawMatrix.tiles.size) {
      const addedPlaceHolders = activePlaceHolders.filter(
        (item) => !activeFormElements.includes(item)
      );
      addedPlaceHolders.forEach((placeholder: string) => {
        const appForm = this.allFields.find(
          (a) => a.placeholder === placeholder
        );
        appForm &&
          [...this.drawMatrix.tiles.values()][0].cdkDropListData.push(appForm);
      });
    }
  }

  private disableFormElement(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    if (this.drawMatrix.tiles.size) {
      const removedPlaceHolders = activeFormElements.filter(
        (item) => !activePlaceHolders.includes(item)
      );
      removedPlaceHolders.forEach((placeHolder) => {
        this.drawMatrix.tiles.forEach((t) => {
          t.cdkDropListData = t.cdkDropListData.filter(
            (obj) => obj.placeholder !== placeHolder
          );
        });
      });
    }
  }

  public drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.saveFormTemplate();
  }

  public getSortedActiveFormElements = (
    field: string,
    term: string
  ): Observable<string[]> => {
    return of(
      this.allFields
        .map((f) => f.placeholder || '')
        .filter((item) => item.toLowerCase().includes(term.toLowerCase()))
    );
  };

  public saveFormTemplate(nameSuffix: string = '', json: string = '') {
    if (this.formName) {
      json = json || this.serializeFormMatrix(this.drawMatrix);
      this.localStorageService.setItem(this.formName + nameSuffix, json);
    } else {
      const errorMsg: string =
        'Error saving form template configuration, the form name is not set!';
      this.toastrService.error(errorMsg);
      throw Error(errorMsg);
    }
  }

  private serializeFormMatrix<T>(formMatrix: FormMatrix<T>): string {
    return JSON.stringify({
      tiles: Array.from(formMatrix.tiles.entries()),
      drawMatrix: formMatrix.drawMatrix,
    });
  }
}
