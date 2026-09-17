import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Send,
  Eye,
  Edit3,
  Upload,
  Link as LinkIcon,
  Bold,
  Italic,
  Code,
  Heading2,
  List,
  Quote,
  Table,
  Sparkles,
  Zap,
  Wrench,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MarkdownRenderer } from '../components/changelog/MarkdownRenderer';
import { ConfirmDialog } from '../components/ui/Dialog';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DEFAULT_MARKDOWN_TEMPLATE = `### 🌟 Overview of This Release

Write a compelling, user-friendly announcement highlighting what is new, improved, or fixed.

#### What Changed:
- **Feature A**: Description of the new capability.
- **Feature B**: Performance optimization or user experience polish.
- **Fix C**: Bug fix detail.

\`\`\`javascript
// Example usage or code snippet
const feature = new ChangelogFeature({ enabled: true });
\`\`\`

> 💡 **Tip**: Clear release notes boost user engagement and product adoption!`;

export const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'New',
    coverImage: '',
    contentMarkdown: DEFAULT_MARKDOWN_TEMPLATE,
    status: 'Draft',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('split'); // 'split', 'editor', 'preview'

  const fileInputRef = useRef(null);

  // Helper to slugify
  const slugifyTitle = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Load existing entry for editing
  useEffect(() => {
    if (isEditMode) {
      const fetchEntry = async () => {
        try {
          const res = await api.get(`/admin/changelog/${id}`);
          if (res.data?.success) {
            const data = res.data.data;
            setFormData({
              title: data.title || '',
              slug: data.slug || '',
              category: data.category || 'New',
              coverImage: data.coverImage || '',
              contentMarkdown: data.contentMarkdown || '',
              status: data.status || 'Draft',
            });
            setSlugManuallyEdited(true);
          }
        } catch (err) {
          toast.error('Failed to load changelog entry');
          navigate('/admin');
        } finally {
          setLoading(false);
        }
      };
      fetchEntry();
    }
  }, [id, isEditMode, navigate, toast]);

  // Auto-sync slug if not manually altered
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: slugManuallyEdited ? prev.slug : slugifyTitle(newTitle),
    }));
  };

  // Image Upload via Multer
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    const data = new FormData();
    data.append('coverImage', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload/cover', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setFormData((prev) => ({ ...prev, coverImage: res.data.data.url }));
        toast.success('Cover image uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Quick Markdown Insertion Toolbar
  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('markdown-editor-area');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || 'text';

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setFormData((prev) => ({ ...prev, contentMarkdown: newText }));

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Save / Publish Action
  const handleSave = async (desiredStatus) => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the update.');
      return;
    }
    if (!formData.contentMarkdown.trim()) {
      toast.error('Markdown content cannot be empty.');
      return;
    }

    const payload = {
      ...formData,
      status: desiredStatus || formData.status,
    };

    setSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/admin/changelog/${id}`, payload);
        toast.success(`Changelog entry updated (${payload.status})`);
      } else {
        const res = await api.post('/admin/changelog', payload);
        toast.success(`Changelog entry created (${payload.status})`);
      }
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save entry';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    try {
      await api.delete(`/admin/changelog/${id}`);
      toast.success('Changelog entry deleted');
      navigate('/admin');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Studio Editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isEditMode ? 'Edit Release Note' : 'Compose Product Release'}
            </h1>
            <p className="text-xs text-slate-400">
              Live split-screen publishing with GitHub alert blocks and syntax highlighting.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditMode && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave('Draft')}
            loading={saving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save as Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave('Published')}
            loading={saving}
            leftIcon={<Send className="h-4 w-4" />}
          >
            {formData.status === 'Published' ? 'Update & Publish' : 'Publish to Live'}
          </Button>
        </div>
      </div>

      {/* Metadata Configuration Card */}
      <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Title */}
          <div className="lg:col-span-6 space-y-1.5">
            <Input
              label="Release Title"
              name="title"
              placeholder="e.g. AI-Powered Smart Search & Semantic Release Filters"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          {/* Slug */}
          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                URL Slug
              </label>
              <button
                type="button"
                onClick={() => {
                  setSlugManuallyEdited(!slugManuallyEdited);
                  if (slugManuallyEdited) {
                    setFormData((prev) => ({ ...prev, slug: slugifyTitle(prev.title) }));
                  }
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                {slugManuallyEdited ? (
                  <>
                    <Unlock className="h-3 w-3" />
                    <span>Custom (Click to auto-sync)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    <span>Auto-syncing (Click to customize)</span>
                  </>
                )}
              </button>
            </div>
            <Input
              name="slug"
              placeholder="url-slug"
              value={formData.slug}
              disabled={!slugManuallyEdited}
              onChange={(e) => setFormData({ ...formData, slug: slugifyTitle(e.target.value) })}
              className="font-mono text-xs"
            />
          </div>

          {/* Category Selector Pills */}
          <div className="lg:col-span-6 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Category Tag
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'New', label: '#New', icon: <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> },
                { id: 'Improved', label: '#Improved', icon: <Zap className="h-3.5 w-3.5 text-emerald-400" /> },
                { id: 'Fixed', label: '#Fixed', icon: <Wrench className="h-3.5 w-3.5 text-amber-400" /> },
              ].map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Image Upload / URL */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Cover Image
              </label>
              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: '' })}
                  className="text-[11px] text-rose-400 hover:text-rose-300"
                >
                  Remove Cover
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="https://images.unsplash.com/... or upload"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                leftIcon={<LinkIcon className="h-4 w-4" />}
                className="text-xs flex-1"
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={uploadingImage}
                leftIcon={<Upload className="h-3.5 w-3.5 text-indigo-400" />}
                className="shrink-0"
              >
                Upload File
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Split-Screen Studio Section */}
      <div className="space-y-3">
        {/* Toolbar & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          {/* Quick Markdown Toolbar */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertMarkdown('### ')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Heading 3"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n```javascript\n', '\n```\n')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono font-bold"
              title="Code Block"
            >
              {'{}'}
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> 💡 **Pro-Tip**: ')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Callout Box"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertMarkdown('\n| Feature | Status |\n| :--- | :---: |\n| Item 1 | ✅ Ready |\n')
              }
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden md:block px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Screen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {/* Split Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Raw Markdown Editor */}
          {(activeTab === 'split' || activeTab === 'editor') && (
            <div className={`space-y-2 ${activeTab === 'editor' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Raw Markdown</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formData.contentMarkdown.length} chars
                </span>
              </div>
              <textarea
                id="markdown-editor-area"
                rows={22}
                value={formData.contentMarkdown}
                onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-100 placeholder-slate-500 font-mono text-xs sm:text-sm p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 shadow-inner resize-y min-h-[480px]"
                placeholder="Write your changelog entry in GitHub-flavored markdown..."
              />
            </div>
          )}

          {/* Right: Live Rendered Split Preview */}
          {(activeTab === 'split' || activeTab === 'preview') && (
            <div className={`space-y-2 ${activeTab === 'preview' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live Rendered Preview</span>
                </span>
                <Badge variant={formData.category} size="sm">
                  Preview Mode
                </Badge>
              </div>

              <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 overflow-y-auto min-h-[480px] max-h-[700px] shadow-2xl">
                {formData.coverImage && (
                  <div className="relative w-full rounded-xl overflow-hidden mb-6 max-h-64 border border-slate-800">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover max-h-64"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={formData.category} size="md" dot>
                      #{formData.category}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      Today • Admin Studio Preview
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {formData.title || 'Untitled Release Announcement'}
                  </h2>

                  <div className="pt-2 border-t border-slate-800/80">
                    <MarkdownRenderer content={formData.contentMarkdown} />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Release"
        description="Are you sure you want to permanently delete this changelog entry?"
        confirmText="Delete Now"
      />
    </div>
  );
};
