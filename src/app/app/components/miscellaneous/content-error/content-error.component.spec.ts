import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentErrorComponent } from './content-error.component';

describe('ContentErrorComponent', () => {
  let component: ContentErrorComponent;
  let fixture: ComponentFixture<ContentErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentErrorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
