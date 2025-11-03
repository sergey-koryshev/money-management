import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalSubmitEvent } from './modal-dialog.model';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent<T> {
  @Input()
  name: string;

  @Input()
  buttonSaveName = 'Save';

  @Input()
  buttonCancelName = 'Cancel';

  @Input()
  disableSubmitButton: boolean;

  @Input()
  hideFooter = false;

  @Input()
  returnValue = (): T | null => null;

  @Input()
  error?: string;

  @Output()
  submit = new EventEmitter<ModalSubmitEvent<T | null>>();

  modalRef: NgbActiveModal;

  constructor(activeModal: NgbActiveModal) {
    this.modalRef = activeModal;
  }

  onSubmitButtonClick() {
    this.submit.emit({
      modalRef: this.modalRef,
      value: this.returnValue()
    })
  }
}
