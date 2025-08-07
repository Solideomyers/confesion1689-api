import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  SearchStrategy,
  FullTextSearch,
  ScriptureReferenceSearch,
} from './search.strategy';
import { SearchQuery, SearchResult } from '../../common/schemas/search.schema';

@Injectable()
export class SearchService {
  private strategies: Map<string, SearchStrategy>;

  constructor(
    private fullTextSearch: FullTextSearch,
    private scriptureReferenceSearch: ScriptureReferenceSearch,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.strategies = new Map<string, SearchStrategy>([
      ['fulltext', this.fullTextSearch],
      ['scripture', this.scriptureReferenceSearch],
    ]);
  }

  async search(
    query: SearchQuery,
    strategy: string = 'fulltext',
  ): Promise<SearchResult> {
    const searchStrategy = this.strategies.get(strategy);
    if (!searchStrategy) {
      throw new Error(`Unknown search strategy: ${strategy}`);
    }

    // Create cache key based on query and strategy
    const cacheKey = `search:${strategy}:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<SearchResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await searchStrategy.search(query);

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  async searchFullText(query: SearchQuery): Promise<SearchResult> {
    return this.search(query, 'fulltext');
  }

  async searchScriptureReferences(query: SearchQuery): Promise<SearchResult> {
    return this.search(query, 'scripture');
  }

  async getAvailableStrategies(): Promise<string[]> {
    return Array.from(this.strategies.keys());
  }
}
