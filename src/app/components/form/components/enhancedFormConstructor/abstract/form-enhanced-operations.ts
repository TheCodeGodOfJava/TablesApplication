import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { TableFormOperations } from '../../../../data-tables/components/abstract/tableFormOperations';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { FormMatrix } from '../../../interfaces/formMatrix';

export class FormEnhancedOperations<T> extends TableFormOperations<T> {
  constructor(
    public allFields: AppEntity<T>[],
    protected formName: string,
    public drawMatrix: FormMatrix<T>,
    protected override fb: FormBuilder,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    super(allFields, fb);
  }

  public dropField(event: CdkDragDrop<any>) {
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
