import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  EyeOff,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/Dialog';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (debouncedSearch.trim()) params.append('q', debouncedSearch.trim());

      const res = await api.get(`/admin/changelog?${params.toString()}`);
      if (res.data?.success) {
        setEntries(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load changelog entries.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, debouncedSearch, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleTogglePublish = async (entry) => {
    const nextStatus = entry.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await api.patch(`/admin/changelog/${entry._id}/publish`, {
        status: nextStatus,
      });
      if (res.data?.success) {
        toast.success(`Entry marked as ${nextStatus}`);
        setEntries((prev) =>
          prev.map((e) => (e._id === entry._id ? { ...e, status: nextStatus, publishedAt: res.data.data.publishedAt } : e))
        );
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/changelog/${deleteId}`);
      toast.success('Changelog entry deleted successfully');
      setEntries((prev) => prev.filter((e) => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Release Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, edit, publish, and schedule product updates across your application.
          </p>
        </div>

        <Link to="/admin/new">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Create New Release
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-slate-900/60 border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {['All', 'Published', 'Draft'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {['All', 'New', 'Improved', 'Fixed'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Tags' : `#${cat}`}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-64">
            <Input
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="text-xs !py-1.5 bg-slate-950"
            />
          </div>
        </div>
      </Card>

      {/* Entries Table */}
      <Card className="overflow-hidden border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase font-mono tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Title & Slug</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Reactions</th>
                <th className="px-6 py-3.5">Published Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading releases...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-bold text-white">No releases match current filter</p>
                      <p className="text-xs">Try clearing your filters or create a new update.</p>
                      <Link to="/admin/new" className="inline-block pt-2">
                        <Button variant="primary" size="sm">Create First Release</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/admin/edit/${item._id}`}
                          className="font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          /{item.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={item.category} size="sm" dot>
                        #{item.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={item.status} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <span>❤️ {item.reactions?.['❤️'] || 0}</span>
                        <span>🎉 {item.reactions?.['🎉'] || 0}</span>
                        <span>🚀 {item.reactions?.['🚀'] || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Publish / Unpublish Toggle */}
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.status === 'Published'
                              ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                              : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                          }`}
                          title={item.status === 'Published' ? 'Unpublish to Draft' : 'Publish to Live'}
                        >
                          {item.status === 'Published' ? <EyeOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>

                        {/* View on Public Page */}
                        {item.status === 'Published' && (
                          <Link
                            to={`/changelog/${item.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
                            title="View on Live Timeline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}

                        {/* Edit */}
                        <Link
                          to={`/admin/edit/${item._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                          title="Edit in Studio"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-colors"
                          title="Delete Release"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Changelog Entry"
        description="Are you sure you want to delete this product update? All associated emoji reactions will also be permanently removed."
        confirmText="Delete Entry"
        loading={isDeleting}
      />
    </div>
  );
};
