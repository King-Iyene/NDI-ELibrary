"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
  FiSearch,
  FiBook,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string;
  category?: { name: string };
  published_year: number;
  publisher: string;
  language: string;
  pages: number;
  cover_image: string;
  file_url: string;
  views: number;
  downloads: number;
  is_active: boolean;
  created_at: string;
}

const initialForm = {
  title: "",
  author: "",
  description: "",
  category_id: "",
  published_year: new Date().getFullYear(),
  publisher: "",
  language: "English",
  pages: 0,
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books?limit=100");
      const data = await res.json();
      setBooks(data.books || []);
    } catch {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(initialForm);
    setCoverFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || "",
      category_id: book.category_id || "",
      published_year: book.published_year || new Date().getFullYear(),
      publisher: book.publisher || "",
      language: book.language || "English",
      pages: book.pages || 0,
    });
    setCoverFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let coverUrl = editingBook?.cover_image || "";
      let fileUrl = editingBook?.file_url || "";

      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        fd.append("type", "cover");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Cover upload failed");
        const uploadData = await uploadRes.json();
        coverUrl = uploadData.url;
      }

      if (pdfFile) {
        const fd = new FormData();
        fd.append("file", pdfFile);
        fd.append("type", "pdf");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("PDF upload failed");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      }

      if (!editingBook && !fileUrl) {
        toast.error("Please upload a PDF file");
        setSubmitting(false);
        return;
      }

      const bookData = {
        ...form,
        cover_image: coverUrl,
        file_url: fileUrl,
      };

      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) throw new Error("Failed to save book");

      toast.success(editingBook ? "Book updated" : "Book added");
      setShowModal(false);
      fetchBooks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Book deleted");
      fetchBooks();
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your library collection</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 btn-primary"
        >
          <FiPlus /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiBook className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>No books found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Downloads</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{book.title}</td>
                    <td className="px-4 py-3 text-gray-600">{book.author}</td>
                    <td className="px-4 py-3 text-gray-600">{book.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{book.views || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{book.downloads || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(book.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  <input required type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
                  <input type="number" value={form.published_year} onChange={(e) => setForm({ ...form, published_year: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input type="text" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input type="text" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                <input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <FiUpload className="text-gray-400" />
                    <span className="text-sm text-gray-500 truncate">{coverFile ? coverFile.name : "Choose image..."}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF File {!editingBook && "*"}</label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <FiUpload className="text-gray-400" />
                    <span className="text-sm text-gray-500 truncate">{pdfFile ? pdfFile.name : "Choose PDF..."}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
