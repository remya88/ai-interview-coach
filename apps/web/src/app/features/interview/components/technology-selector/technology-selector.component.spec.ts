import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TechnologySelectorComponent } from './technology-selector.component';
import { InterviewService } from '../../services/interview.service';
import { Technology } from '../../models/interview.model';

describe('TechnologySelectorComponent', () => {
  let component: TechnologySelectorComponent;
  let fixture: ComponentFixture<TechnologySelectorComponent>;
  let mockInterviewService: jest.Mocked<InterviewService>;

  const mockTechnologies: Technology[] = [
    { id: '1', name: 'Angular', slug: 'angular', color: '#dd0031' },
    { id: '2', name: 'React', slug: 'react', color: '#61dafb' },
    { id: '3', name: 'Vue', slug: 'vue', color: '#4fc08d' },
  ];

  beforeEach(async () => {
    mockInterviewService = {
      getTechnologies: jest.fn(),
    } as unknown as jest.Mocked<InterviewService>;

    await TestBed.configureTestingModule({
      imports: [TechnologySelectorComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [{ provide: InterviewService, useValue: mockInterviewService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologySelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selected technology', (done: DoneFn) => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.selected.subscribe((tech: Technology) => {
        expect(tech).toEqual(mockTechnologies[0]);
        done();
      });

      component.onTechSelect(mockTechnologies[0]);
    });
  });

  it('should display selected technology details', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.onTechSelect(mockTechnologies[0]);
      fixture.detectChanges();

      expect(component.selectedTech()).toEqual(mockTechnologies[0]);
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Angular');
    });
  });

  it('should filter technologies by search', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.searchControl.setValue('react');
      fixture.detectChanges();

      component.filteredTechs$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('React');
      });
    });
  });

  it('should filter by slug', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.searchControl.setValue('ang');
      fixture.detectChanges();

      component.filteredTechs$.subscribe(filtered => {
        expect(filtered.some(t => t.slug.includes('ang'))).toBe(true);
      });
    });
  });

  it('should reset search on tech select', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.onTechSelect(mockTechnologies[0]);
      fixture.detectChanges();

      expect(component.searchControl.value).toBe('Angular');
    });
  });

  it('should return all techs with empty search', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('technologies', mockTechnologies);
      fixture.detectChanges();

      component.searchControl.setValue('');
      fixture.detectChanges();

      component.filteredTechs$.subscribe(filtered => {
        expect(filtered.length).toBe(mockTechnologies.length);
      });
    });
  });
});
