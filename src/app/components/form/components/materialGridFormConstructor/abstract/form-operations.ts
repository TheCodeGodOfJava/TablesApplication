import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { TableFormOperations } from '../../../../data-tables/components/abstract/tableFormOperations';
import { Tile } from '../../../interfaces/tile';
export class FormOperations<T> extends TableFormOperations<T> {
  constructor(
    protected allFields: AppEntity<T>[],
    protected formName: string,
    public tiles: Tile<T>[],
    protected override fb: FormBuilder,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    super(allFields, fb);
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
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
    this.saveFormTemplate();
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
      json = json || JSON.stringify(this.tiles);
      this.localStorageService.setItem(this.formName + nameSuffix, json);
    } else {
      const errorMsg: string =
        'Error saving form template configuration, the form name is not set!';
      this.toastrService.error(errorMsg);
      throw Error(errorMsg);
    }
  }
}
