import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitConfirmationComponent } from './submit-confirmation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SubmitConfirmationComponent', () => {
  let component: SubmitConfirmationComponent;
  let fixture: ComponentFixture<SubmitConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitConfirmationComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display stats', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('charCount', 150);
      fixture.componentRef.setInput('wordCount', 25);
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('150');
    expect(content).toContain('25');
  });

  it('should format time seconds', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('timeSpent', 45);
    });

    expect(component.formatTime()).toBe('45s');
  });

  it('should format time minutes and seconds', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('timeSpent', 125);
    });

    expect(component.formatTime()).toBe('2m 5s');
  });

  it('should display time spent if provided', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('timeSpent', 45);
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('45s');
  });

  it('should emit confirm event when confirm clicked', () => {
    const confirmSpy = jest.spyOn(component.confirm, 'emit');

    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const confirmButton = buttons.find((btn: any) => btn.textContent.includes('Submit'));
    confirmButton?.click();

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel clicked', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');

    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const cancelButton = buttons[0];
    cancelButton?.click();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should show hint when multiple attempts allowed', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('allowMultipleAttempts', true);
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('retake this interview multiple times');
  });
});
