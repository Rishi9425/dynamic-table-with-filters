import { TestBed } from '@angular/core/testing';
import { TableFilterAdvancedDemo } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFilterAdvancedDemo],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(TableFilterAdvancedDemo);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'table' title`, () => {
    const fixture = TestBed.createComponent(TableFilterAdvancedDemo);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('table');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(TableFilterAdvancedDemo);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, table');
  });
});
