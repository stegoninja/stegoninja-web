import { TestBed } from '@angular/core/testing';
import { SymmetryCallout } from './symmetry-callout';

describe('SymmetryCallout', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('extract mode explains matching', async () => {
    const fixture = TestBed.createComponent(SymmetryCallout);
    fixture.componentRef.setInput('mode', 'extract');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('same technique');
  });

  it('video adds the exact-AVI reminder', async () => {
    const fixture = TestBed.createComponent(SymmetryCallout);
    fixture.componentRef.setInput('video', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.toLowerCase()).toContain('exact avi');
  });
});
