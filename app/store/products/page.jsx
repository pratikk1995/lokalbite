'use client';

import { useState, useEffect } from 'react';
import StoreNav from '@/components/StoreNav';

export default function StoreProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [error, setError] = useState('');

  // Add product form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/stores/mine');
      const data = await res.json();
      if (res.ok && data.store) {
        setProducts(data.store.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      setError('Please fill in name, price, and category');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      // Refresh list
      setProducts([data.product, ...products]);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setAddingProduct(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailable = async (productId, currentStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle product status');

      // Update local state
      setProducts(products.map(p => p.id === productId ? data.product : p));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-lg font-extrabold text-slate-800">Menu Manager</h1>
        <button
          onClick={() => setAddingProduct(!addingProduct)}
          className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-sm"
        >
          {addingProduct ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Add Product Card */}
        {addingProduct && (
          <div className="card bg-white slide-up">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3">Add Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Special Masala Dosa"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input text-xs"
                  disabled={formLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Served with coconut chutney and sambar"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input text-xs"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 60"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="input text-xs"
                    disabled={formLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. South Indian"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input text-xs"
                    disabled={formLoading}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-2xs text-rose-500 font-bold">⚠️ {error}</p>}

              <button
                type="submit"
                className="btn-primary py-2.5 text-xs font-bold"
                disabled={formLoading}
              >
                {formLoading ? 'Adding item...' : 'Add to Menu'}
              </button>
            </form>
          </div>
        )}

        {/* Catalog List */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Catalog Menu ({products.length})
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="card animate-pulse h-24 bg-white" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <span className="text-4xl mb-2 block">🍔</span>
              <p className="text-slate-500 font-bold">No Products Added Yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Click "+ Add Item" above to add products to your digital storefront.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="card bg-white p-4 flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{product.name}</h4>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 rounded uppercase">
                        {product.category}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-2xs text-slate-400 mt-0.5 line-clamp-1">{product.description}</p>
                    )}
                    <p className="text-xs font-extrabold text-slate-700 mt-1.5">₹{product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Toggle available */}
                    <button
                      onClick={() => handleToggleAvailable(product.id, product.available)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        product.available
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-rose-50 border-rose-100 text-rose-500'
                      }`}
                    >
                      {product.available ? 'In Stock' : 'Out of Stock'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-8 h-8 hover:bg-slate-100 border border-slate-100 flex items-center justify-center rounded-lg text-sm transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StoreNav />
    </div>
  );
}
