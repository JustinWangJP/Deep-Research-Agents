// i18n TypeScript型定義

export interface CommonTranslations {
  app: {
    title: string;
    subtitle: string;
    systemOnline: string;
  };
  navigation: {
    dashboard: string;
    agents: string;
    search: string;
    memory: string;
    citations: string;
  };
  common: {
    // 基本アクション
    loading: string;
    error: string;
    success: string;
    // CRUD操作
    create: string;
    read: string;
    update: string;
    delete: string;
    // フォーム操作
    save: string;
    cancel: string;
    submit: string;
    reset: string;
    // ナビゲーション
    back: string;
    next: string;
    previous: string;
    // その他
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    settings: string;
    recentActivity: string;
    // 追加の共通アクション
    edit: string;
    view: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    confirm: string;
  };
  status: {
    idle: string;
    running: string;
    completed: string;
    error: string;
    paused: string;
  };
  dateTime: {
    now: string;
    today: string;
    yesterday: string;
    lastWeek: string;
    lastMonth: string;
    never: string;
  };
}

export interface AgentsTranslations {
  title: string;
  subtitle: string;
  list: {
    title: string;
    subtitle: string;
    empty: string;
    lastActivity: string;
    noActivity: string;
    plugins: string;
  };
  details: {
    information: string;
    configuration: string;
    performance: string;
    logs: string;
  };
  actions: {
    start: string;
    stop: string;
    restart: string;
    configure: string;
    viewLogs: string;
    delete: string;
  };
  status: {
    idle: string;
    running: string;
    completed: string;
    error: string;
    paused: string;
  };
  plugins: {
    [key: string]: string;
  };
  agents: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

export interface SearchTranslations {
  title: string;
  subtitle: string;
  form: {
    query: {
      label: string;
      placeholder: string;
      required: string;
    };
    documentType: {
      label: string;
      placeholder: string;
      all: string;
    };
    provider: {
      label: string;
      azure: string;
      tavily: string;
      internal: string;
    };
    maxResults: {
      label: string;
    };
    temperature: {
      label: string;
      conservative: string;
      balanced: string;
      creative: string;
    };
    includeWeb: {
      label: string;
    };
  };
  results: {
    title: string;
    empty: string;
    loading: string;
    error: string;
    totalResults: string;
    executionTime: string;
    provider: string;
    score: string;
    confidence: string;
    source: string;
    highlights: string;
  };
  actions: {
    search: string;
    clear: string;
    export: string;
    saveQuery: string;
  };
}

export interface MemoryTranslations {
  title: string;
  subtitle: string;
  list: {
    title: string;
    empty: string;
    loading: string;
  };
  entry: {
    content: string;
    type: string;
    source: string;
    memoryType: string;
    tags: string;
    createdAt: string;
    updatedAt: string;
    relevanceScore: string;
  };
  types: {
    general: string;
    research: string;
    citation: string;
    agent_communication: string;
    system: string;
  };
  memoryTypes: {
    session: string;
    persistent: string;
    temporary: string;
  };
  actions: {
    add: string;
    edit: string;
    delete: string;
    search: string;
    filter: string;
    export: string;
  };
  stats: {
    totalEntries: string;
    entryTypes: string;
    sources: string;
    memoryTypes: string;
    tags: string;
    storageSize: string;
  };
}

export interface CitationsTranslations {
  title: string;
  subtitle: string;
  list: {
    title: string;
    empty: string;
    loading: string;
  };
  citation: {
    content: string;
    sourceTitle: string;
    sourceUrl: string;
    caseNumber: string;
    pageNumber: string;
    confidence: string;
    tags: string;
    metadata: string;
    createdAt: string;
    updatedAt: string;
  };
  actions: {
    add: string;
    edit: string;
    delete: string;
    copy: string;
    export: string;
    import: string;
  };
  filters: {
    caseNumber: string;
    sourceTitle: string;
    tags: string;
    confidence: string;
  };
  formats: {
    apa: string;
    mla: string;
    chicago: string;
    harvard: string;
  };
}

export interface FormsTranslations {
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    number: string;
    url: string;
  };
  messages: {
    success: string;
    error: string;
    saving: string;
    saved: string;
    loading: string;
    noChanges: string;
  };
  actions: {
    submit: string;
    save: string;
    cancel: string;
    reset: string;
    clear: string;
  };
}

export interface ErrorsTranslations {
  network: {
    offline: string;
    timeout: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
  };
  validation: {
    required: string;
    invalid: string;
    tooShort: string;
    tooLong: string;
  };
  api: {
    agentNotFound: string;
    searchFailed: string;
    memoryError: string;
    citationError: string;
  };
  generic: {
    unknown: string;
    tryAgain: string;
    contactSupport: string;
  };
}

// 拡張されたダッシュボード翻訳インターフェース
export interface DashboardTranslations {
  agentDashboard: {
    title: string;
    subtitle: string;
    systemOnline: string;
  };
  stats: {
    totalAgents: string;
    activeAgents: string;
    completedTasks: string;
    failedTasks: string;
    memoryUsage: string;
    avgResponseTime: string;
    systemPerformance: string;
    agentStatus: string;
    running: string;
    completed: string;
    error: string;
    idle: string;
  };
  agentsList: {
    title: string;
    subtitle: string;
    lastActivity: string;
    noActivity: string;
    plugins: string;
  };
  status: {
    running: string;
    completed: string;
    error: string;
    idle: string;
    paused: string;
  };
  plugins: {
    [key: string]: string;
  };
  agents: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

// 全体の翻訳リソース型
export interface TranslationResources {
  common: CommonTranslations;
  dashboard: DashboardTranslations;
  agents: AgentsTranslations;
  search: SearchTranslations;
  memory: MemoryTranslations;
  citations: CitationsTranslations;
  forms: FormsTranslations;
  errors: ErrorsTranslations;
}

// 言語コード型
export type LanguageCode = 'en' | 'ja';

// 数値フォーマット設定型
export interface NumberFormatOptions {
  decimal: Intl.NumberFormatOptions;
  percent: Intl.NumberFormatOptions;
  currency: Intl.NumberFormatOptions;
}

// 日時フォーマット設定型
export interface DateTimeFormatOptions {
  short: Intl.DateTimeFormatOptions;
  long: Intl.DateTimeFormatOptions;
  time: Intl.DateTimeFormatOptions;
}

// フォーマット設定型
export interface FormatSettings {
  number: Record<LanguageCode, NumberFormatOptions>;
  dateTime: Record<LanguageCode, DateTimeFormatOptions>;
}