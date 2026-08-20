// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialRowsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  paginatedData: T[];
  handleChangePage: (page: number) => void;
  handleChangeRowsPerPage: (rows: number) => void;
  resetPage: () => void;
}

export default function usePagination<T>({
  data,
  initialRowsPerPage = 5,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = useMemo(
    () => Math.ceil(data.length / rowsPerPage),
    [data.length, rowsPerPage]
  );

  const paginatedData = useMemo(
    () => data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage),
    [data, currentPage, rowsPerPage]
  );

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(0);
  };

  const resetPage = () => {
    setCurrentPage(0);
  };

  return {
    currentPage,
    rowsPerPage,
    totalPages,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  };
}
