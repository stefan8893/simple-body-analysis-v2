import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyAnalysisComponent } from './weekly-analysis.component';

describe('WeeklyAnalysisComponent', () => {
  let component: WeeklyAnalysisComponent;
  let fixture: ComponentFixture<WeeklyAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
