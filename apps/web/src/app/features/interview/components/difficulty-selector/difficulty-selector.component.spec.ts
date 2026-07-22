import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DifficultySelectorComponent } from './difficulty-selector.component';
import { DifficultyLevel } from '@prisma/client';

describe('DifficultySelectorComponent', () => {
  let component: DifficultySelectorComponent;
  let fixture: ComponentFixture<DifficultySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DifficultySelectorComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DifficultySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all difficulty options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const options = compiled.querySelectorAll('[class*="border-"]');

    expect(options.length).toBeGreaterThan(0);
  });

  it('should emit selected difficulty', (done: DoneFn) => {
    component.selected.subscribe((difficulty: DifficultyLevel) => {
      expect(difficulty).toBe('INTERMEDIATE');
      done();
    });

    component.selectDifficulty('INTERMEDIATE' as DifficultyLevel);
  });

  it('should mark option as selected', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('selectedValue', 'ADVANCED');
      fixture.detectChanges();

      expect(component.isSelected('ADVANCED' as DifficultyLevel)).toBe(true);
      expect(component.isSelected('BEGINNER' as DifficultyLevel)).toBe(false);
    });
  });

  it('should update selected via input', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('selectedValue', 'SENIOR');
      fixture.detectChanges();

      expect(component.isSelected('SENIOR' as DifficultyLevel)).toBe(true);
    });
  });
});
