import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  FolderOpen, Plus, Trash2, Folder, Layers,
  ChevronRight, ChevronDown, Check, AlertTriangle
} from 'lucide-react';
import CategoryService from '@api/services/category.service';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import { Card } from '@components/ui/Card';
import { cn, getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  // Selected parent category ID for creating a subcategory/sub-subcategory
  const [parentId, setParentId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [expandedIds, setExpandedIds] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  // Fetch category tree (Levels 1, 2, and 3)
  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: CategoryService.getTree,
  });

  // Fetch flat categories list to populate parent dropdown
  const { data: flatData, isLoading: isFlatLoading } = useQuery({
    queryKey: ['admin-categories-flat'],
    queryFn: CategoryService.getFlat,
  });

  const categoriesTree = treeData?.data || [];
  const flatCategories = flatData?.data || [];

  // Toggle tree node collapse/expand
  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: (newCat) => CategoryService.create(newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-flat'] });
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] }); // invalidate public drawer cache
      setCategoryName('');
      setParentId('');
      setDisplayOrder('0');
      toast.success('Category created successfully! 🎉');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-flat'] });
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] }); // invalidate public drawer cache
      setDeletingId(null);
      toast.success('Category deleted successfully! 🗑️');
    },
    onError: (err) => {
      setDeletingId(null);
      toast.error(getErrorMessage(err));
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    createMutation.mutate({
      name: categoryName.trim(),
      parent_id: parentId || null,
      display_order: parseInt(displayOrder) || 0,
      icon_url: null, // Left null to avoid URL format validation errors
    });
  };

  const handleDelete = (id, name, childrenCount) => {
    const confirmMessage = childrenCount > 0
      ? `Are you sure you want to delete "${name}"? Doing so will also hide/disable all of its ${childrenCount} nested subcategories.`
      : `Are you sure you want to delete "${name}"?`;

    if (window.confirm(confirmMessage)) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  // Recursive Category Row Renderer
  const renderCategoryNode = (cat, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const childrenCount = cat.children ? cat.children.length : 0;
    const isExpanded = expandedIds[cat.id];

    return (
      <div key={cat.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center justify-between rounded-xl p-3 border border-transparent transition-all duration-200",
            depth === 0 ? "bg-[var(--color-surface-elevated)]" : "bg-transparent"
          )}
          style={{
            marginLeft: `${depth * 20}px`,
            borderLeft: depth > 0 ? '2px solid var(--color-border)' : undefined,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="p-1 rounded hover:bg-[var(--glass-bg-strong)] text-[var(--color-text-secondary)]"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-6" /> // spacer
            )}

            {depth === 0 ? (
              <Folder className="text-[var(--color-brand)] flex-shrink-0" size={18} />
            ) : depth === 1 ? (
              <Layers className="text-purple-400 flex-shrink-0" size={16} />
            ) : (
              <ChevronRight className="text-pink-400 flex-shrink-0" size={14} />
            )}

            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                {cat.name}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                slug: <span className="font-mono">{cat.slug}</span>
              </p>
            </div>

            {childrenCount > 0 && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(91,110,245,0.1)',
                  color: 'var(--color-brand)',
                }}
              >
                {childrenCount} nested
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setParentId(cat.id);
                // focus category name input
                document.getElementById('cat-name-input')?.focus();
              }}
              title="Add subcategory under this"
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Plus size={16} />
            </button>
            <button
              disabled={deletingId === cat.id}
              onClick={() => handleDelete(cat.id, cat.name, childrenCount)}
              className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {deletingId === cat.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-error)] border-t-transparent" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Render child nodes if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {cat.children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const isLoading = isTreeLoading || isFlatLoading;

  return (
    <>
      <Helmet>
        <title>Manage Categories — Admin Panel</title>
      </Helmet>

      <div className="space-y-6">
        <PageHeader
          title="Categories Management"
          subtitle="Add, nested-structure, or delete platform categories, subcategories, and sub-subcategories."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ═══ LEFT: Categories Tree Explorer ═══════════ */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 md:p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <FolderOpen className="text-[var(--color-brand)]" size={20} />
                Taxonomy Explorer
              </h3>

              {isLoading ? (
                <div className="flex h-60 flex-col items-center justify-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Loading taxonomy trees...
                  </p>
                </div>
              ) : categoriesTree.length === 0 ? (
                <div className="p-12 text-center text-sm border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  No categories found. Create a root category on the right to start.
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {categoriesTree.map((cat) => renderCategoryNode(cat, 0))}
                </div>
              )}
            </Card>
          </div>

          {/* ═══ RIGHT: Create Category Form ══════════════ */}
          <div>
            <Card className="p-4 md:p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Plus className="text-emerald-400" size={20} />
                Create Category
              </h3>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Category Name *
                  </label>
                  <input
                    id="cat-name-input"
                    type="text"
                    required
                    placeholder="e.g. Vintage Apparel, Car Parts"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* Parent Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Parent Category (Nesting)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="">None (Top-Level Root Category)</option>
                    {flatCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parent_id ? '↳ ' : ''}{c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Select None to create a main category. Select an existing category to make it a subcategory (Level 2) or sub-subcategory (Level 3).
                  </p>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Higher value pushes category to the end of listing lists.
                  </p>
                </div>

                {/* Warning Card */}
                {parentId && (
                  <div className="p-3 rounded-xl border text-xs flex gap-2"
                    style={{
                      borderColor: 'rgba(245, 158, 11, 0.3)',
                      backgroundColor: 'rgba(245, 158, 11, 0.05)',
                      color: 'var(--color-warning)'
                    }}
                  >
                    <AlertTriangle className="flex-shrink-0" size={16} />
                    <p>
                      You are nesting this new item as a sub-level category. It will inherit inheritance constraints and display in the drilldown explorer drawer.
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  fullWidth
                  isLoading={createMutation.isPending}
                  leftIcon={<Check size={16} />}
                >
                  Create Category
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
