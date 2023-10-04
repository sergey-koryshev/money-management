import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent {
  @Input()
  name: string;

  @Input()
  buttonSaveName = 'Save';

  @Input()
  buttonCancelName = 'Cancel';

  @Input()
  modalRef: NgbActiveModal;

  @Input()
  disableSubmitButton: boolean;

  @Input()
  returnValue: unknown;
}
