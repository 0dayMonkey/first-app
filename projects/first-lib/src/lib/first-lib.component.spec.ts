import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstLibComponent } from './first-lib.component';

describe('FirstLibComponent', () => {
  let component: FirstLibComponent;
  let fixture: ComponentFixture<FirstLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
