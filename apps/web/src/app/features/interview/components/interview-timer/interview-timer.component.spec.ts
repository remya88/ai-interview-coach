import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InterviewTimerComponent } from './interview-timer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('InterviewTimerComponent', () => {
  let component: InterviewTimerComponent;
  let fixture: ComponentFixture<InterviewTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewTimerComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewTimerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format time correctly', () => {
    expect(component.formatTime(0)).toBe('00:00');
    expect(component.formatTime(59)).toBe('00:59');
    expect(component.formatTime(60)).toBe('01:00');
    expect(component.formatTime(125)).toBe('02:05');
    expect(component.formatTime(3661)).toBe('61:01');
  });

  it('should display time', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 125);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('02:05');
  });

  it('should apply warning class when time is low', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 30);
      fixture.componentRef.setInput('warningThreshold', 60);
    });
    fixture.detectChanges();

    const timerDiv = fixture.nativeElement.querySelector('.flex');
    expect(timerDiv.classList.contains('bg-yellow-100')).toBe(true);
  });

  it('should apply danger class when time is zero', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 0);
    });
    fixture.detectChanges();

    const timerDiv = fixture.nativeElement.querySelector('.flex');
    expect(timerDiv.classList.contains('bg-red-100')).toBe(true);
  });

  it('should apply normal class when time is sufficient', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 300);
      fixture.componentRef.setInput('warningThreshold', 60);
    });
    fixture.detectChanges();

    const timerDiv = fixture.nativeElement.querySelector('.flex');
    expect(timerDiv.classList.contains('bg-blue-50')).toBe(true);
  });

  it('should emit tick events when running', fakeAsync(() => {
    const tickSpy = jest.spyOn(component.tick, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 100);
      fixture.componentRef.setInput('isRunning', true);
    });
    fixture.detectChanges();

    component.ngOnInit();
    tick(1000);

    expect(tickSpy).toHaveBeenCalledWith(99);
  }));

  it('should not emit ticks when not running', fakeAsync(() => {
    const tickSpy = jest.spyOn(component.tick, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('remainingSeconds', 100);
      fixture.componentRef.setInput('isRunning', false);
    });
    fixture.detectChanges();

    component.ngOnInit();
    tick(1000);

    expect(tickSpy).not.toHaveBeenCalled();
  }));
});
