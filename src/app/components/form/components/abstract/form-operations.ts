import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { TableFormOperations } from '../../../data-tables/components/abstract/tableFormOperations';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { Tile } from '../../interfaces/tile';

export class FormOperations<T> extends TableFormOperations<T> {
  public activeFormElements: string[] = [];

  private tiles!: Tile<T>[];

  constructor(
    public all: AppEntity<T>[],
    public formTiles: Tile<T>[],
    protected override fb: FormBuilder,
    private toastrService: ToastrService
  ) {
    super(all, fb);
    this.tiles = formTiles;
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    if (this.tiles.length) {
      if (formControl) {
        const activePlaceHolders = formControl.value;
        this.enableFormElements(activePlaceHolders);
        this.disableFormElement(activePlaceHolders);
        this.activeFormElements = activePlaceHolders;
        this.toastrService.success('Form configuration successfully changed!');
      }
    } else {
      formControl?.reset();
      this.toastrService.error(
        'No form containers found! Please add at least one form container!'
      );
    }
  };

  private enableFormElements(activePlaceHolders: string[]): void {
    if (this.tiles.length) {
      const addedPlaceHolders = activePlaceHolders.filter(
        (item) => !this.activeFormElements.includes(item)
      );
      addedPlaceHolders.forEach((placeholder: string) => {
        const appForm = this.all.find((a) => a.placeholder === placeholder);
        appForm && this.tiles[0].cdkDropListData.push(appForm);
      });
    }
  }

  private disableFormElement(activePlaceHolders: string[]): void {
    if (this.tiles.length) {
      const removedPlaceHolders = this.activeFormElements.filter(
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

  drop(event: CdkDragDrop<any>) {
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
      this.all
        .map((f) => f.placeholder || '')
        .filter((item) => item.toLowerCase().includes(term.toLowerCase()))
    );
  };
}
