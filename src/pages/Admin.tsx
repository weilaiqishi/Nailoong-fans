// src/pages/Admin.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Sticker } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';

// Form component for creating/editing a sticker
const StickerForm = ({ stickerToEdit, onFormSubmit, clearEdit }: { stickerToEdit: Sticker | null, onFormSubmit: () => void, clearEdit: () => void }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stickerToEdit) {
      setTitle(stickerToEdit.title ?? '');
      setImageUrl(stickerToEdit.image_url ?? '');
      setDescription(stickerToEdit.description ?? '');
    } else {
      setTitle('');
      setImageUrl('');
      setDescription('');
    }
  }, [stickerToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
        toast.error('Image URL is required.');
        return;
    }
    setIsSubmitting(true);

    const stickerData = {
        title: title || null,
        image_url: imageUrl,
        description: description || null,
    };

    let error;
    if (stickerToEdit) {
        // Update logic
        const { error: updateError } = await supabase.from('stickers').update(stickerData).eq('id', stickerToEdit.id);
        error = updateError;
    } else {
        // Create logic
        const { error: insertError } = await supabase.from('stickers').insert(stickerData);
        error = insertError;
    }

    if (error) {
        toast.error(error.message);
    } else {
        toast.success(`Sticker ${stickerToEdit ? 'updated' : 'added'} successfully!`);
        onFormSubmit(); // Refresh list
        clearEdit(); // Clear form
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{stickerToEdit ? 'Edit Sticker' : 'Add New Sticker'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
          <input type="text" name="image_url" id="image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
        </div>
        <div className="flex justify-end gap-4">
          {stickerToEdit && <button type="button" onClick={clearEdit} className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md">Cancel Edit</button>}
          <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Sticker'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Batch Upload Component
const BatchUploadForm = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleBatchUpload = async () => {
    if (!file) {
      toast.error("Please select a JSON file first.");
      return;
    }
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("Failed to read file content.");
        }
        const json = JSON.parse(text);

        if (!Array.isArray(json)) {
          throw new Error("JSON file must contain an array of sticker objects.");
        }

        const validStickers = json.filter(item =>
          item && typeof item.image_url === 'string' && item.image_url.trim() !== ''
        ).map(item => ({
          image_url: item.image_url,
          title: item.title && typeof item.title === 'string' ? item.title : null,
          description: item.description && typeof item.description === 'string' ? item.description : null,
        }));

        const invalidCount = json.length - validStickers.length;
        if (invalidCount > 0) {
            toast.info(`${invalidCount} items were filtered out due to missing or invalid image_url.`);
        }

        if (validStickers.length === 0) {
          toast.error("No valid stickers found in the file to upload.");
          return;
        }

        const { error } = await supabase.from('stickers').insert(validStickers);

        if (error) {
          throw error;
        }

        toast.success(`${validStickers.length} stickers uploaded successfully!`);
        onUploadComplete();

      } catch (error: any) {
        toast.error("Upload failed: " + error.message);
      } finally {
        setIsUploading(false);
        setFile(null);
        const fileInput = document.getElementById('batch-upload-input') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Batch Upload from JSON</h2>
      <div className="flex items-center gap-4">
        <input
          id="batch-upload-input"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        <button
          onClick={handleBatchUpload}
          disabled={isUploading || !file}
          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
       <p className="text-xs text-gray-500 mt-2">
        Select a JSON file containing an array of objects. Only `image_url` is required.
      </p>
    </div>
  );
};

// Table component to display stickers
const StickerList = ({ stickers, onEdit, onDelete }: { stickers: Sticker[], onEdit: (sticker: Sticker) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 p-6">Sticker Management</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stickers.map((sticker) => (
                        <tr key={sticker.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img src={sticker.image_url} alt={sticker.title ?? ''} className="w-16 h-16 object-cover rounded-md" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sticker.title}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{sticker.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(sticker)} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 mr-4">Edit</button>
                                <button onClick={() => onDelete(sticker.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

// Header for the Admin page including Sign Out
const AdminHeader = () => {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Error signing out: ' + error.message);
        } else {
            toast.success('Signed out successfully!');
        }
    };

    return (
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Panel</h1>
            <button
                onClick={handleSignOut}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Sign Out
            </button>
        </header>
    );
};


// The main component that holds the CRUD logic
const StickerManager = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [stickerToEdit, setStickerToEdit] = useState<Sticker | null>(null);

  const fetchStickers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('stickers').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error(error.message);
    } else if (data) {
      setStickers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sticker?')) {
        const { error } = await supabase.from('stickers').delete().eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Sticker deleted successfully!');
            fetchStickers(); // Refresh list
        }
    }
  };

  const handleEdit = (sticker: Sticker) => {
    setStickerToEdit(sticker);
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  return (
      <>
        <AdminHeader />
        <StickerForm stickerToEdit={stickerToEdit} onFormSubmit={fetchStickers} clearEdit={() => setStickerToEdit(null)} />
        <BatchUploadForm onUploadComplete={fetchStickers} />
        {loading ? <p className="text-center">Loading stickers...</p> : <StickerList stickers={stickers} onEdit={handleEdit} onDelete={handleDelete} />}
      </>
  );
}


export default function AdminPage() {
  const { theme, isDark } = useTheme();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {!session ? (
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                 <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">Admin Login</h1>
                 <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['github', 'google']} // Example providers
                    theme={isDark ? 'dark' : 'default'}
                />
            </div>
        ) : (
          <StickerManager />
        )}
      </div>
    </div>
  );
}