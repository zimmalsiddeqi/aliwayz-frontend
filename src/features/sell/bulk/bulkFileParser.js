// src/features/sell/bulk/bulkFileParser.js
// ─────────────────────────────────────────────────────────────
// Parses an uploaded CSV or Excel file and returns normalized
// row objects keyed by canonical column names.
// ─────────────────────────────────────────────────────────────

import { readSheet } from 'read-excel-file/browser';
import {
  mapHeaders,
  MAX_BULK_ROWS,
  MAX_BULK_FILE_MB,
} from './bulkSchema.js';

/**
 * Parse a CSV string into rows of string arrays.
 * Handles double-quoted fields.
 */
function csvToRows(text) {
  const rows = [];
  let current = [];
  let cell = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (c === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuote = false;
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === ',') {
        current.push(cell);
        cell = '';
      } else if (c === '\n' || (c === '\r' && next === '\n')) {
        current.push(cell);
        cell = '';
        if (current.some((v) => v.trim())) rows.push(current);
        current = [];
        if (c === '\r') i++;
      } else if (c === '\r') {
        current.push(cell);
        cell = '';
        if (current.some((v) => v.trim())) rows.push(current);
        current = [];
      } else {
        cell += c;
      }
    }
  }
  current.push(cell);
  if (current.some((v) => v.trim())) rows.push(current);
  return rows;
}

/**
 * Read a file (CSV or XLSX) and return a { headers: string[], dataRows: string[][] }
 */
async function readFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv' || ext === 'tsv') {
    const text = await file.text();
    const all = csvToRows(text);
    if (all.length === 0) throw new Error('File is empty');
    return { headers: all[0], dataRows: all.slice(1) };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const data = await readSheet(file);
    if (!data || data.length === 0) throw new Error('File is empty');
    return {
      headers: data[0].map((v) => String(v ?? '')),
      dataRows: data.slice(1).map((row) => row.map((v) => String(v ?? ''))),
    };
  }

  throw new Error('Unsupported file type. Upload a CSV (.csv) or Excel (.xlsx) file');
}

/**
 * Parse and validate an uploaded file for a given bulk type.
 *
 * @param {File}   file   The uploaded CSV / XLSX file
 * @param {string} type   BULK_TYPES value
 * @returns {{ rawHeaders, indexToKey, recognized, ignored, missingColumns, rows, totalDataRows, error }}
 */
export async function parseUploadedFile(file, type) {
  // Size check
  if (file.size > MAX_BULK_FILE_MB * 1024 * 1024) {
    return { error: `File is too large. Maximum size is ${MAX_BULK_FILE_MB} MB` };
  }

  let headers;
  let dataRows;
  try {
    const result = await readFile(file);
    headers = result.headers;
    dataRows = result.dataRows;
  } catch (err) {
    return { error: err.message || 'Failed to read file. Make sure it is a valid CSV or Excel file' };
  }

  if (dataRows.length === 0) {
    return { error: 'File has no data rows — only headers were found' };
  }

  // Map headers
  const { indexToKey, recognized, ignored, missing: missingColumns } = mapHeaders(headers, type);

  // Convert raw rows to normalized objects
  const rows = [];
  const max = Math.min(dataRows.length, MAX_BULK_ROWS);
  for (let i = 0; i < max; i++) {
    const rawRow = dataRows[i];
    // Skip completely blank rows
    if (rawRow.every((v) => !String(v ?? '').trim())) continue;

    const obj = {};
    rawRow.forEach((val, colIdx) => {
      const key = indexToKey[colIdx];
      if (key) obj[key] = String(val ?? '').trim();
    });
    rows.push(obj);
  }

  return {
    rawHeaders: headers,
    indexToKey,
    recognized,
    ignored,
    missingColumns,
    rows,
    totalDataRows: dataRows.length,
    truncated: dataRows.length > MAX_BULK_ROWS,
    error: null,
  };
}

/**
 * Generate and download a CSV template file for the given bulk type.
 */
export function downloadTemplate(columns, fileName) {
  const headers = columns.map((c) => {
    let label = c.label;
    if (c.required) label += ' *';
    return label;
  });

  // Two example rows
  const row1 = columns.map((c) => (c.example ? c.example[0] : ''));
  const row2 = columns.map((c) => (c.example ? c.example[1] : ''));

  const escape = (v) => {
    const t = String(v ?? '');
    return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };

  const csv = [headers, row1, row2].map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
