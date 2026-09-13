declare module '@tanstack/react-query' {
  import type { ComponentType, ReactNode } from 'react';

  export class QueryClient {
    constructor(config?: unknown);
  }

  export const QueryClientProvider: ComponentType<{
    client: QueryClient;
    children?: ReactNode;
  }>;
}
