import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { TableFormOperations } from '../../../data-tables/components/abstract/tableFormOperations';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { callFunction } from '../../decorators/callFunction';
import { Tile } from '../../interfaces/tile';

export class FormOperations<T> extends TableFormOperations<T> {
  constructor(
    protected allFields: AppEntity<T>[],
    protected formName: string,
    protected tiles: Tile<T>[],
    protected override fb: FormBuilder,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    super(allFields, fb);
  }

  @callFunction('saveFormTemplate')
  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    console.log(this.tiles);
    if (this.tiles.length) {
      if (formControl && formControl.value.length) {
        const activePlaceHolders = formControl.value;
        const activeFormElements = this.tiles
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
  };

  private enableFormElements(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    if (this.tiles.length) {
      const addedPlaceHolders = activePlaceHolders.filter(
        (item) => !activeFormElements.includes(item)
      );
      addedPlaceHolders.forEach((placeholder: string) => {
        const appForm = this.allFields.find(
          (a) => a.placeholder === placeholder
        );
        appForm && this.tiles[0].cdkDropListData.push(appForm);
      });
    }
  }

  private disableFormElement(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    if (this.tiles.length) {
      const removedPlaceHolders = activeFormElements.filter(
        (item) => !activePlaceHolders.includes(item)
      );
      removedPlaceHolders.forEach((placeHolder) => {
        this.tiles.forEach((t) => {
          t.cdkDropListData = t.cdkDropListData.filter(
            (obj) => obj.placeholder !== placeHolder
          );
        });
      });
    }
  }

  @callFunction('saveFormTemplate')
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

  public saveFormTemplate() {
    if (this.formName) {
      this.localStorageService.setItem(
        this.formName,
        JSON.stringify(this.tiles)
      );
      this.toastrService.success('Form template successfully saved!');
    } else {
      const errorMsg: string =
        'Error saving form template configuration, the form name is not set!';
      this.toastrService.error(errorMsg);
      throw Error(errorMsg);
    }
  }
}
