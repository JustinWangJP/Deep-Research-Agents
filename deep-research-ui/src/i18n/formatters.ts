import { useTranslation } from 'react-i18next';

// 数値フォーマット用のカスタムフック
export const useNumberFormat = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  const formatPercent = (value: number, minimumFractionDigits = 1, maximumFractionDigits = 1) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  };

  const formatCurrency = (value: number, currency?: string) => {
    const currencyCode = currency || (locale === 'ja' ? 'JPY' : 'USD');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const formatFileSize = (bytes: number): string => {
    const units = locale === 'ja' 
      ? ['バイト', 'KB', 'MB', 'GB', 'TB']
      : ['bytes', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0) return `0 ${units[0]}`;
    
    const k = 1024;
    const dm = 2;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${units[i]}`;
  };

  const formatMemoryUsage = (bytes: number): string => {
    return formatFileSize(bytes);
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (locale === 'ja') {
      if (days > 0) return `${days}日 ${hours % 24}時間`;
      if (hours > 0) return `${hours}時間 ${minutes % 60}分`;
      if (minutes > 0) return `${minutes}分 ${seconds % 60}秒`;
      return `${seconds}秒`;
    } else {
      if (days > 0) return `${days}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    }
  };

  return {
    formatNumber,
    formatPercent,
    formatCurrency,
    formatFileSize,
    formatMemoryUsage,
    formatDuration,
  };
};

// 日時フォーマット用のカスタムフック
export const useDateTimeFormat = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  };

  const formatShortDate = (date: Date | string) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLongDate = (date: Date | string) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return formatDate(date, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
      return locale === 'ja' ? '現在' : 'Now';
    } else if (diffInMinutes < 60) {
      return locale === 'ja' ? `${diffInMinutes}分前` : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return locale === 'ja' ? `${diffInHours}時間前` : `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return locale === 'ja' ? '昨日' : 'Yesterday';
    } else if (diffInDays < 7) {
      return locale === 'ja' ? `${diffInDays}日前` : `${diffInDays}d ago`;
    } else if (diffInWeeks === 1) {
      return locale === 'ja' ? '先週' : 'Last Week';
    } else if (diffInDays < 30) {
      return locale === 'ja' ? `${diffInWeeks}週間前` : `${diffInWeeks}w ago`;
    } else if (diffInMonths === 1) {
      return locale === 'ja' ? '先月' : 'Last Month';
    } else {
      return formatShortDate(dateObj);
    }
  };

  return {
    formatDate,
    formatShortDate,
    formatLongDate,
    formatTime,
    formatRelativeTime,
  };
};

// 汎用フォーマット関数
export const formatters = {
  // 数値フォーマット
  number: (value: number, locale: string, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  },

  // パーセンテージフォーマット
  percent: (value: number, locale: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  },

  // 通貨フォーマット
  currency: (value: number, locale: string, currency?: string) => {
    const currencyCode = currency || (locale === 'ja' ? 'JPY' : 'USD');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  },

  // 日時フォーマット
  date: (date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  },
};