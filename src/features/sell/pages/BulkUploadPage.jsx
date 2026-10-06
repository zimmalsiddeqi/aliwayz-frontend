import { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Package,
  Trash2,
} from 'lucide-react';
import useMyStore from '@hooks/useMyStore';
import useAuthStore from '@store/auth.store';
import useLocationStore from '@store/location.store';
import CategoryService from '@api/services/category.service';
import ProductService from '@api/services/product.service';
import StoreService from '@api/services/store.service';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import { cn, getErrorMessage, formatPrice } from '@lib/utils';
import toast from '@lib/toast';

import {
  BULK_TYPE_INFO,
  BULK_COLUMNS,
  buildListing,
  MAX_BULK_ROWS,
} from '../bulk/bulkSchema.js';
import { parseUploadedFile, downloadTemplate } from '../bulk/bulkFileParser.js';
import { resolveCategory } from '../bulk/bulkCategoryMapper.js';

// ─────────────────────────────────────────────────────────────
// STEPS
// ─────────────────────────────────────────────────────────────
const STEPS = {
  CHOOSE_TYPE: 0,
  UPLOAD: 1,
  PREVIEW: 2,
  PUBLISHING: 3,
  DONE: 4,
};

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { lat: userLat, lng: userLng, city: userCity, state: userState } = useLocationStore();
  const { store, hasStore, isLoading: storeLoading, refetch: refetchStore } = useMyStore();

  const [step, setStep] = useState(STEPS.CHOOSE_TYPE);
  const [bulkType, setBulkType] = useState(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // Preview state
  const [listings, setListings] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Publishing state
  const [publishProgress, setPublishProgress] = useState({ done: 0, total: 0, successes: 0, failures: [] });

  // Category tree for auto-mapping
  const { data: flatCategories = [] } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  // Auto-create store for quick listings
  const autoCreateMutation = useMutation({
    mutationFn: () =>
      StoreService.create({
        store_name: `${user?.full_name || user?.username || 'My'} Listings`,
        description: 'Personal listings',
        location_city: '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      refetchStore();
      toast.success('All set! You can now upload your listings.');
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.includes('already')) refetchStore();
      else toast.error(msg);
    },
  });

  // ── Handlers ──────────────────────────────────────────────
  const handleSelectType = (type) => {
    setBulkType(type);
    setStep(STEPS.UPLOAD);
    setFile(null);
    setParseResult(null);
    setParseError(null);
    setListings([]);
  };

  const handleFileDrop = useCallback(
    async (droppedFile) => {
      if (!droppedFile) return;
      setFile(droppedFile);
      setParseError(null);
      setIsParsing(true);

      try {
        const result = await parseUploadedFile(droppedFile, bulkType);
        if (result.error) {
          setParseError(result.error);
          setParseResult(null);
          setIsParsing(false);
          return;
        }

        if (result.missingColumns.length > 0) {
          setParseResult(result);
          setParseError(null);
          setIsParsing(false);
          return;
        }

        // Build listings
        const ctx = {
          store,
          user: { lat: userLat, lng: userLng, city: userCity, state: userState },
          status: 'available',
        };

        const built = result.rows.map((row, idx) => {
          const listing = buildListing(row, bulkType, ctx);
          const cat = resolveCategory(row, listing, bulkType, flatCategories);
          listing.payload.category_id = cat.categoryId;
          return {
            rowIndex: idx + 1,
            raw: row,
            ...listing,
            category: cat,
            selected: listing.errors.length === 0,
          };
        });

        setListings(built);
        setParseResult(result);
        setIsParsing(false);
        setStep(STEPS.PREVIEW);
      } catch (err) {
        setParseError(err.message || 'Failed to process file');
        setIsParsing(false);
      }
    },
    [bulkType, store, userLat, userLng, userCity, userState, flatCategories]
  );

  const handlePublish = useCallback(async () => {
    const selected = listings.filter((l) => l.selected && l.errors.length === 0);
    if (selected.length === 0) {
      toast.error('No valid listings to publish');
      return;
    }

    setStep(STEPS.PUBLISHING);
    setPublishProgress({ done: 0, total: selected.length, successes: 0, failures: [] });

    let successes = 0;
    const failures = [];

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      try {
        const res = await ProductService.create(item.payload);
        const createdProduct = res?.data;

        // Image strategy: upload the spreadsheet image or auto category cover photo
        const targetImgUrl = item.imageUrls?.[0] || item.placeholderImage;
        if (targetImgUrl && createdProduct?.id) {
          try {
            const imgRes = await fetch(targetImgUrl, { mode: 'cors' });
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const imgFile = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
              const fd = new FormData();
              fd.append('file', imgFile, imgFile.name);
              await ProductService.uploadImages(createdProduct.id, fd).catch(() => {});
            }
          } catch (_) {
            // Handled gracefully; frontend auto-fallback guarantees photo display
          }
        }

        successes++;
      } catch (err) {
        failures.push({
          rowIndex: item.rowIndex,
          title: item.display.title,
          error: getErrorMessage(err),
        });
      }
      setPublishProgress({ done: i + 1, total: selected.length, successes, failures: [...failures] });
    }

    // Invalidate caches
    queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });

    setStep(STEPS.DONE);
  }, [listings, queryClient]);

  const toggleRow = (idx) => {
    setListings((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, selected: !l.selected } : l))
    );
  };

  const selectAll = (selected) => {
    setListings((prev) =>
      prev.map((l) => (l.errors.length === 0 ? { ...l, selected } : l))
    );
  };

  const stats = useMemo(() => {
    const valid = listings.filter((l) => l.errors.length === 0);
    const selected = listings.filter((l) => l.selected && l.errors.length === 0);
    const withErrors = listings.filter((l) => l.errors.length > 0);
    const withWarnings = listings.filter((l) => l.warnings.length > 0 && l.errors.length === 0);
    return { valid: valid.length, selected: selected.length, withErrors: withErrors.length, withWarnings: withWarnings.length, total: listings.length };
  }, [listings]);

  // ── Loading ───────────────────────────────────────────────
  if (storeLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── No Store ──────────────────────────────────────────────
  if (!hasStore) {
    return (
      <>
        <Helmet>
          <title>Bulk Upload — Aliwayz</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="mx-auto max-w-lg space-y-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="space-y-3 text-center">
            <span className="block text-5xl">📦</span>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Store Required for Bulk Upload
            </h2>
            <p className="mx-auto max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              You need a store before you can upload listings in bulk
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => autoCreateMutation.mutate()}
              disabled={autoCreateMutation.isPending}
              className="w-full"
              leftIcon={autoCreateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            >
              Quick Start — Create a Store
            </Button>
            <Button variant="outline" onClick={() => navigate('/store/create')} className="w-full">
              Set Up a Custom Store
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bulk Upload — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          {step === STEPS.CHOOSE_TYPE && <TypeSelector key="type" onSelect={handleSelectType} onBack={() => navigate('/sell/my-listings')} />}

          {step === STEPS.UPLOAD && (
            <UploadStep
              key="upload"
              type={bulkType}
              file={file}
              isParsing={isParsing}
              parseError={parseError}
              parseResult={parseResult}
              onFileDrop={handleFileDrop}
              onBack={() => { setStep(STEPS.CHOOSE_TYPE); setBulkType(null); setFile(null); setParseResult(null); setParseError(null); }}
              onContinue={() => {
                if (parseResult && parseResult.missingColumns.length === 0 && listings.length > 0) {
                  setStep(STEPS.PREVIEW);
                }
              }}
            />
          )}

          {step === STEPS.PREVIEW && (
            <PreviewStep
              key="preview"
              type={bulkType}
              listings={listings}
              stats={stats}
              expandedRow={expandedRow}
              onToggleExpand={(idx) => setExpandedRow(expandedRow === idx ? null : idx)}
              onToggleRow={toggleRow}
              onSelectAll={selectAll}
              onRemoveRow={(idx) => setListings((prev) => prev.filter((_, i) => i !== idx))}
              onBack={() => { setStep(STEPS.UPLOAD); setFile(null); setParseResult(null); setListings([]); }}
              onPublish={handlePublish}
            />
          )}

          {step === STEPS.PUBLISHING && <PublishingStep key="pub" progress={publishProgress} />}

          {step === STEPS.DONE && (
            <DoneStep
              key="done"
              progress={publishProgress}
              onGoToListings={() => navigate('/sell/my-listings')}
              onUploadMore={() => {
                setStep(STEPS.CHOOSE_TYPE);
                setBulkType(null);
                setFile(null);
                setParseResult(null);
                setListings([]);
                setPublishProgress({ done: 0, total: 0, successes: 0, failures: [] });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 0 — Type Selector
// ──────────────────────────────────────────────────────────────
function TypeSelector({ onSelect, onBack }) {
  const categories = Object.values(BULK_TYPE_INFO);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> My Listings
      </button>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Bulk Upload</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Choose a category to upload multiple listings at once from a CSV or Excel file</p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(cat.id)}
            className="group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110" style={{ background: cat.gradient }}>
              <span className="drop-shadow">{cat.emoji}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{cat.label}</h3>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>{cat.desc}</p>
            </div>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-text-muted)' }} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 1 — Upload
// ──────────────────────────────────────────────────────────────
function UploadStep({ type, file, isParsing, parseError, parseResult, onFileDrop, onBack }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const info = BULK_TYPE_INFO[type];
  const columns = BULK_COLUMNS[type] || [];
  const [showColumns, setShowColumns] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onFileDrop(f);
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileDrop(f);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <span>{info.emoji}</span> Upload {info.label} Listings
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Upload a CSV or Excel file with up to {MAX_BULK_ROWS} listings
        </p>
      </div>

      {/* Template download */}
      <div
        className="flex items-center justify-between gap-3 rounded-xl p-3"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FileSpreadsheet size={18} style={{ color: 'var(--color-brand)' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Download Template
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Pre-formatted CSV with all columns and example rows
            </p>
          </div>
        </div>
        <Button
          size="xs"
          variant="outline"
          leftIcon={<Download size={14} />}
          onClick={() => downloadTemplate(columns, info.fileName)}
        >
          CSV
        </Button>
      </div>

      {/* Column reference */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => setShowColumns(!showColumns)}
          className="flex w-full items-center justify-between p-3 text-left"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Column Reference ({columns.length} fields)
          </span>
          {showColumns ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}
        </button>
        {showColumns && (
          <div className="max-h-64 overflow-y-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-xs" style={{ color: 'var(--color-text-primary)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                  <th className="px-3 py-1.5 text-left font-semibold" style={{ color: 'var(--color-text-muted)' }}>Column</th>
                  <th className="px-3 py-1.5 text-left font-semibold" style={{ color: 'var(--color-text-muted)' }}>Required</th>
                  <th className="px-3 py-1.5 text-left font-semibold" style={{ color: 'var(--color-text-muted)' }}>Hint</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col) => (
                  <tr key={col.key} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-1.5 font-medium">{col.label}</td>
                    <td className="px-3 py-1.5">
                      {col.required ? (
                        <span className="text-red-500 font-bold">Yes</span>
                      ) : col.recommended ? (
                        <span style={{ color: 'var(--color-brand)' }}>Recommended</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Optional</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)' }}>{col.hint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all',
          dragging && 'scale-[1.02]'
        )}
        style={{
          borderColor: dragging ? 'var(--color-brand)' : 'var(--color-border)',
          backgroundColor: dragging ? 'var(--color-brand-glow)' : 'var(--color-surface)',
        }}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
        {isParsing ? (
          <>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Processing file...</p>
          </>
        ) : (
          <>
            <Upload size={32} style={{ color: 'var(--color-text-muted)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {file ? file.name : 'Drop your CSV or Excel file here'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                or click to browse · CSV, XLSX · Max {MAX_BULK_ROWS} rows
              </p>
            </div>
          </>
        )}
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{parseError}</p>
        </div>
      )}

      {/* Missing required columns */}
      {parseResult && parseResult.missingColumns.length > 0 && (
        <div className="space-y-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              Missing Required Columns
            </p>
          </div>
          <ul className="list-disc pl-5 text-xs text-red-600 dark:text-red-400 space-y-0.5">
            {parseResult.missingColumns.map((m) => (
              <li key={m.key}><strong>{m.label}</strong> — {m.message}</li>
            ))}
          </ul>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Add these columns to your file and re-upload, or download the template above.
          </p>
        </div>
      )}

      {/* Recognized columns info */}
      {parseResult && parseResult.missingColumns.length === 0 && parseResult.recognized.length > 0 && (
        <div className="space-y-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {parseResult.recognized.length} columns recognized · {parseResult.rows.length} data rows
            </p>
          </div>
          {parseResult.ignored.length > 0 && (
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Ignored columns: {parseResult.ignored.join(', ')}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 2 — Preview
// ──────────────────────────────────────────────────────────────
function PreviewStep({ type, listings, stats, expandedRow, onToggleExpand, onToggleRow, onSelectAll, onRemoveRow, onBack, onPublish }) {
  const info = BULK_TYPE_INFO[type];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={16} /> Re-Upload
        </button>
        <Button
          size="sm"
          leftIcon={<Upload size={14} />}
          disabled={stats.selected === 0}
          onClick={onPublish}
        >
          Publish {stats.selected} {stats.selected === 1 ? 'Listing' : 'Listings'}
        </Button>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold flex items-center justify-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <span>{info.emoji}</span> Preview — {info.label}
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Review your listings before publishing. De-select any rows you want to skip
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatBadge label="Total" count={stats.total} color="var(--color-text-muted)" />
        <StatBadge label="Valid" count={stats.valid} color="rgb(34,197,94)" />
        <StatBadge label="Selected" count={stats.selected} color="var(--color-brand)" />
        {stats.withErrors > 0 && <StatBadge label="Errors" count={stats.withErrors} color="rgb(239,68,68)" />}
        {stats.withWarnings > 0 && <StatBadge label="Warnings" count={stats.withWarnings} color="rgb(234,179,8)" />}
        <div className="ml-auto flex gap-2">
          <Button size="xs" variant="outline" onClick={() => onSelectAll(true)}>Select All</Button>
          <Button size="xs" variant="outline" onClick={() => onSelectAll(false)}>Deselect All</Button>
        </div>
      </div>

      {/* Listing rows */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {listings.map((item, idx) => (
          <ListingRow
            key={idx}
            item={item}
            idx={idx}
            isExpanded={expandedRow === idx}
            onToggleExpand={() => onToggleExpand(idx)}
            onToggleSelect={() => onToggleRow(idx)}
            onRemove={() => onRemoveRow(idx)}
          />
        ))}
      </div>

      {/* Bottom publish button */}
      <div className="flex justify-end pt-2">
        <Button
          leftIcon={<Upload size={14} />}
          disabled={stats.selected === 0}
          onClick={onPublish}
        >
          Publish {stats.selected} {stats.selected === 1 ? 'Listing' : 'Listings'}
        </Button>
      </div>
    </motion.div>
  );
}

function StatBadge({ label, count, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color }}>
      {count} {label}
    </span>
  );
}

function ListingRow({ item, isExpanded, onToggleExpand, onToggleSelect, onRemove }) {
  const hasErrors = item.errors.length > 0;
  const hasWarnings = item.warnings.length > 0;

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${hasErrors ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
        opacity: hasErrors ? 0.65 : 1,
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.selected && !hasErrors}
          disabled={hasErrors}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded accent-[var(--color-brand)]"
        />

        {/* Row number */}
        <span className="text-[10px] font-mono w-5 text-center shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {item.rowIndex}
        </span>

        {/* Photo Thumbnail */}
        {item.display.imageUrl && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
            <img
              src={item.display.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                if (item.placeholderImage && e.target.src !== item.placeholderImage) {
                  e.target.src = item.placeholderImage;
                }
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {item.display.title || '(No title)'}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {item.display.price !== undefined && (
              <span className="text-[11px] font-bold" style={{ color: 'var(--color-brand)' }}>
                {formatPrice(item.display.price)}
              </span>
            )}
            {item.display.conditionLabel && (
              <span className="text-[10px] rounded px-1 py-0.5" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>
                {item.display.conditionLabel}
              </span>
            )}
            {item.display.subtitle && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{item.display.subtitle}</span>
            )}
            {item.display.hasUserImage ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                📷 Photo
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--color-text-muted)' }} title="Cover photo assigned automatically">
                ✨ Auto Photo
              </span>
            )}
            {item.category?.autoMapped && (
              <span className="inline-flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--color-brand)' }}>
                <Sparkles size={10} /> {item.category.categoryName}
              </span>
            )}
            {item.category && !item.category.autoMapped && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                📁 {item.category.categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasErrors && <AlertCircle size={14} className="text-red-500" />}
          {hasWarnings && !hasErrors && <AlertTriangle size={14} className="text-yellow-500" />}
          {!hasErrors && !hasWarnings && <CheckCircle2 size={14} className="text-green-500" />}
          <button onClick={onToggleExpand} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
            {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}
          </button>
          <button onClick={onRemove} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-3 py-2.5 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
              {hasErrors && (
                <div className="space-y-1">
                  {item.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-600 dark:text-red-400">
                      <AlertCircle size={12} className="mt-0.5 shrink-0" />
                      {e}
                    </div>
                  ))}
                </div>
              )}
              {hasWarnings && (
                <div className="space-y-1">
                  {item.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
              {/* Raw data preview */}
              <div className="mt-2">
                <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Raw Data</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {Object.entries(item.raw)
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>{k}:</span>{' '}
                        {String(v).length > 60 ? String(v).slice(0, 60) + '...' : v}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 3 — Publishing
// ──────────────────────────────────────────────────────────────
function PublishingStep({ progress }) {
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 space-y-6">
      <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Publishing Listings...</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {progress.done} of {progress.total} · {pct}%
        </p>
      </div>
      {/* Progress bar */}
      <div className="w-full max-w-md rounded-full h-2" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-brand), #8B5CF6)' }} />
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Please don&apos;t close this page</p>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 4 — Done
// ──────────────────────────────────────────────────────────────
function DoneStep({ progress, onGoToListings, onUploadMore }) {
  const { successes, failures } = progress;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-8">
      <div className="text-center space-y-3">
        <span className="block text-5xl">{failures.length === 0 ? '🎉' : '⚠️'}</span>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {failures.length === 0 ? 'All Listings Published!' : 'Upload Complete'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <strong className="text-green-500">{successes}</strong> listing{successes !== 1 ? 's' : ''} published successfully
          {failures.length > 0 && (
            <>, <strong className="text-red-500">{failures.length}</strong> failed</>
          )}
        </p>
      </div>

      {failures.length > 0 && (
        <div className="space-y-2 rounded-xl p-3 max-h-48 overflow-y-auto" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">Failed Listings</p>
          {failures.map((f, i) => (
            <div key={i} className="text-[11px] text-red-600 dark:text-red-400">
              <strong>Row {f.rowIndex}:</strong> {f.title} — {f.error}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onUploadMore} leftIcon={<Upload size={14} />}>Upload More</Button>
        <Button onClick={onGoToListings} leftIcon={<Package size={14} />}>Go to My Listings</Button>
      </div>
    </motion.div>
  );
}
