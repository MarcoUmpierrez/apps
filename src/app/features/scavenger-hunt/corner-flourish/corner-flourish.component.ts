import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A single top-left corner ornament, reused for all four corners by mirroring
 * it with CSS transforms (-scale-x-100 / -scale-y-100) at the call site
 * rather than drawing four separate SVGs.
 */
@Component({
  selector: 'app-corner-flourish',
  template: `
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 52 V16 Q4 4 16 4 H52" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M4 36 Q4 20 20 20" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
      <path d="M36 4 Q20 4 20 20" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <circle cx="4" cy="52" r="2.5" fill="currentColor" />
      <circle cx="52" cy="4" r="2.5" fill="currentColor" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CornerFlourishComponent {}
