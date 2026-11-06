import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { reportService } from '../services/reportService';
import type {
  ReportFilterState,
  ReportData,
  DatePreset,
} from '../types/report.types';

function getPresetDates(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (preset) {
    case 'THIS_MONTH': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      return { startDate: start, endDate: todayStr };
    }
    case 'LAST_MONTH': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0];
      return { startDate: start, endDate: end };
    }
    case 'THIS_YEAR': {
      const start = `${now.getFullYear()}-01-01`;
      return { startDate: start, endDate: todayStr };
    }
    case 'ALL_TIME': {
      return { startDate: '2020-01-01', endDate: todayStr };
    }
    case 'CUSTOM':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      return { startDate: start, endDate: todayStr };
    }
  }
}

export function useReports() {
  const initialDates = getPresetDates('THIS_MONTH');
  const [filters, setFilters] = useState<ReportFilterState>({
    preset: 'THIS_MONTH',
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.generateReport(filters);
      setReportData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate financial report';
      console.error('[useReports] Error generating report:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const setPreset = (preset: DatePreset) => {
    if (preset === 'CUSTOM') {
      setFilters((prev) => ({ ...prev, preset: 'CUSTOM' }));
    } else {
      const { startDate, endDate } = getPresetDates(preset);
      setFilters((prev) => ({ ...prev, preset, startDate, endDate }));
    }
  };

  const setCustomDateRange = (startDate: string, endDate: string) => {
    setFilters((prev) => ({ ...prev, preset: 'CUSTOM', startDate, endDate }));
  };

  const setAccountId = (accountId?: string) => {
    setFilters((prev) => ({ ...prev, accountId: accountId || undefined }));
  };

  const setTransactionTypeId = (typeId?: string) => {
    setFilters((prev) => ({ ...prev, transactionTypeId: typeId || undefined }));
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const label = `${filters.startDate} to ${filters.endDate}`;
    reportService.exportToCSV(reportData, label);
    toast.success('Financial report CSV downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    filters,
    reportData,
    isLoading,
    error,
    setPreset,
    setCustomDateRange,
    setAccountId,
    setTransactionTypeId,
    handleExportCSV,
    handlePrint,
    refetch: fetchReport,
  };
}
