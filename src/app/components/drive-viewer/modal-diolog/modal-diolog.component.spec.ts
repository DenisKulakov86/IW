import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDiologComponent } from './modal-diolog.component';

describe('ModalDiologComponent', () => {
  let component: ModalDiologComponent;
  let fixture: ComponentFixture<ModalDiologComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDiologComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDiologComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
