import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewHeaderComponent } from './interview-header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('InterviewHeaderComponent', () => {
  let component: InterviewHeaderComponent;
  let fixture: ComponentFixture<InterviewHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewHeaderComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display technology and category names', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologyName', 'JavaScript');
      fixture.componentRef.setInput('categoryName', 'Functions');
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('JavaScript');
    expect(content).toContain('Functions');
  });

  it('should emit togglePause event when pause button clicked', () => {
    const pauseSpy = jest.spyOn(component.togglePause, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('isPaused', false);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click(); // First button is pause/play

    expect(pauseSpy).toHaveBeenCalled();
  });

  it('should emit exit event when close button clicked', () => {
    const exitSpy = jest.spyOn(component.exit, 'emit');

    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[buttons.length - 1].click(); // Last button is exit

    expect(exitSpy).toHaveBeenCalled();
  });

  it('should show play icon when paused', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('isPaused', true);
    });
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('mat-icon');
    expect(icons[0].textContent.trim()).toContain('play_arrow');
  });

  it('should show pause icon when not paused', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('isPaused', false);
    });
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('mat-icon');
    expect(icons[0].textContent.trim()).toContain('pause');
  });
});
