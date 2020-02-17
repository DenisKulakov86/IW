import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriveViewerComponent } from './drive-viewer.component';

describe('DriveViewerComponent', () => {
  let component: DriveViewerComponent;
  let fixture: ComponentFixture<DriveViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriveViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriveViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
