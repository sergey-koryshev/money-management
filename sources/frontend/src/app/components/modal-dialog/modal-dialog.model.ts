import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export interface ModalSubmitEvent<T = undefined> {
  modalRef: NgbActiveModal,
  value?: T
}
