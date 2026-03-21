import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface WebApp {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly url: string;
  readonly category: 'Tools' | 'Games' | 'Utility';
  readonly color: string;
}

/**
 * Interface representing a web application entry in the dashboard.
 */
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly title = signal('dashboard');
  private readonly apps = signal<WebApp[]>([
    {
      id: '1',
      title: 'Focus Timer',
      description: 'A minimalist, hands-free interval timer that beeps every second and switches sounds between work and rest so you never have to glance at your phone.',
      icon: '⏱️',
      url: 'timer',
      category: 'Tools',
      color: 'bg-linear-to-br from-rose-700 to-pink-800'
    },
  ]);

  /** Signal for UI state */
  public readonly isSidebarOpen = signal<boolean>(false);
  public readonly selectedCategory = signal<string>('all');
  public readonly searchQuery = signal<string>('');

  /** Computed list of unique categories from the app data */
  public readonly categories = ['all', 'Tools', 'Games', 'Utility'];

  /** * Computed signal for filtering the app list based on search and category
   */
  public readonly filteredApps = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    return this.apps().filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(query) ||
                           app.description.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || app.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  /**
   * Updates the search query state
   * @param event Input event from the search field
   */
  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  /**
   * Toggles the mobile sidebar visibility
   */
  public toggleSidebar(): void {
    this.isSidebarOpen.update(prev => !prev);
  }

  /**
   * Updates the selected category filter
   * @param category The category name to filter by
   */
  public setSelectedCategory(category: string): void {
    this.selectedCategory.set(category);
    // Auto-close sidebar on mobile after selection
    this.isSidebarOpen.set(false);
  }
}
