import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="shell">
      <router-outlet />
    </main>
  `,
  styles: [`.shell { min-height: 100vh; }`],
})
export class LayoutComponent {}
