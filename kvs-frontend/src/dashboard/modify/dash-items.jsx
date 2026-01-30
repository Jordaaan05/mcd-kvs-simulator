import React, { useEffect, useState } from 'react';
import api from '../../modules/api';
import DashNav from '../dash-nav';
import '../../css/dashboard.css'

import fetchItems from '../../order-router/fetch-modules/fetchItems';

function DashItems({ handlePageChange, activePage }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [editing, setEditing] = useState({}); // { itemId: { fieldName: value, ... } }
    const [rowDirty, setRowDirty] = useState({}); // rows with unsaved changes
    const [saving, setSaving] = useState({}); // per row save state
    const [newItem, setNewItem] = useState(null);
    const [errors, setErrors] = useState({}); // { itemId: { field: msg } }
    const [sortBy, setSortBy] = useState('category');
    const [sortDir, setSortDir] = useState('asc');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // fetch items and categories in parallel and normalise shapes
                const [itemsResCandidate, catsRes] = await Promise.all([
                    (async () => {
                        try {
                            return await fetchItems(); // if this returns items with categories already, great
                        } catch (e) {
                            // fallback to direct call if fetchItems is not available / fails
                            const r = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`);
                            return r.data;
                        }
                    })(),
                    api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/categories`)
                ]);

                const fetchedCats = Array.isArray(catsRes.data) ? catsRes.data : [];
                setCategories(fetchedCats); // FIX

                // normalise shapes so UI always has item.categories (array) and item.category (string)
                const normalised = (itemsResCandidate || []).map(it => {
                    let categoriesArray = [];

                    if (Array.isArray(it.Categories) && it.Categories.length) {
                        categoriesArray = it.Categories;
                    } else if (it.Category) {
                        categoriesArray = [it.Category];
                    } else if (it.category && typeof it.category === 'string') {
                        categoriesArray = [{ name: it.category }];
                    }

                    const categoryName = (categoriesArray[0] && categoriesArray[0].name) || '';

                    return {
                        ...it,
                        categories: categoriesArray,
                        category: categoryName
                    };
                });

                setItems(normalised);
            } catch (err) {
                console.error('Failed to fetch items', err);
            } finally {
                setLoading(false);
            };
        };
        load();
    }, []);

    // validation rules
    const validateField = (field, value) => {
        if (field === 'price') {
            if (value === '' || value === null || value === undefined) return 'A valid price is required.';
            const asStr = String(value);
            if (!/^\d+(?:\.\d{2})?$/.test(asStr)) return 'Must be a number with 2 decimal places';
            return null;
        }
        if (field === 'display') {
            if (!value || value.trim() === '') return 'Display name is required.';
            if (value.length > 20) return 'Display name must be at most 20 characters.';
            return null;
        }
        if (field === 'name') {
            if (!value || value.trim() === '') return 'Product name is required.';
            if (value.length > 50) return 'Product name must be at most 50 characters.';
            return null;
        }
        if (field === 'category') {
            if (!value || value.trim() === '') return 'Category required'
            // optional: enforce that value is in the fetched categories list
            if (categories.length && !categories.find(c => c.name === value)) return 'Select a valid category'
            if (value.length > 30) return 'Category must be 30 chars or less'
            return null
        };
        return null;
    };


    const validateRow = (itemId, candidate) => {
        const rowErrors = {};
        const fields = ['name', 'display', 'price', 'category'];
        for (const f of fields) {
            const val = candidate[f];
            const err = validateField(f, val);
            if (err) rowErrors[f] = err;
        }
        return rowErrors;
    };

    const startEdit = (itemId, field, currentValue) => {
        // seed editing with current server-side value (ensure category select shows assigned value)
        setEditing(prev => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || {}),
                [field]: currentValue !== undefined ? currentValue : (prev[itemId] && prev[itemId][field])
            }
        }));
        setRowDirty(prev => ({ ...prev, [itemId]: true }));
    };
    const cancelEdit = (itemId) => {
        setEditing(prev => {
            const copy = { ...prev };
            delete copy[itemId];
            return copy;
        });
        setErrors(prev => {
            const copy = { ...prev };
            delete copy[itemId];
            return copy;
        });
        setRowDirty(prev => ({ ...prev, [itemId]: false }));
    };

    const changeEdit = (itemId, field, value) => {
        setEditing(prev => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || {}),
                [field]: value
            }
        }));
        setRowDirty(prev => ({ ...prev, [itemId]: true }));

        const err = validateField(field, value);
        setErrors(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: err } }));
    };

    // helper to fetch authoritative single item (including categories)
    const fetchSingleOption = async (itemId) => {
        try {
            const r = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options/${itemId}`);
            const it = r.data;
            let categoriesArray = [];
            if (Array.isArray(it.categories) && it.categories.length) categoriesArray = it.categories;
            else if (it.Category) categoriesArray = [it.Category];
            else if (it.category && typeof it.category === 'string') categoriesArray = [{ name: it.category }];
            return { ...it, categories: categoriesArray, category: (categoriesArray[0] && categoriesArray[0].name) || '' };
        } catch (err) {
            console.error('Failed to fetch single option', err);
            return null;
        }
    }

    const saveRow = async (itemId) => {
        const base = items.find(i => i.id === itemId) || {};
        const edits = editing[itemId] || {};
        const candidate = { ...base, ...edits };

        const rowErrors = validateRow(itemId, candidate);
        if (Object.keys(rowErrors).length > 0) {
            setErrors(prev => ({ ...prev, [itemId]: rowErrors }));
            return
        };

        setSaving(prev => ({ ...prev, [itemId]: true }));
        try {
            const payload = {
                name: candidate.name,
                price: parseFloat(Number(candidate.price).toFixed(2)),
                display: candidate.display,
                category: candidate.category
            };

            console.log("Modifying....")
            await api.put(`/options/${itemId}`, payload);
            console.log("Done!")

            // after PUT, fetch authoritative item with categories and update list so UI shows assigned category immediately
            const authoritative = await fetchSingleOption(itemId);
            if (authoritative) {
                setItems(prev => prev.map(it => (it.id === itemId ? authoritative : it)));
            } else {
                // fallback: update with candidate
                setItems(prev => prev.map(it => (it.id === itemId ? { ...candidate } : it)));
            }

            setEditing(prev => {
                const copy = { ...prev }
                delete copy[itemId]
                return copy
            });
            setErrors(prev => {
                const copy = { ...prev }
                delete copy[itemId]
                return copy
            });
            setRowDirty(prev => ({ ...prev, [itemId]: false }));
        } catch (err) {
            console.error('Failed to save item', err);
            alert('Failed to save item. See console for more details.');
        } finally {
            setSaving(prev => ({ ...prev, [itemId]: false }));
        };
    };

    const handleCreateNew = async () => {
        if (!newItem) return
        const rowErrors = validateRow('new', newItem)
        if (Object.keys(rowErrors).length > 0) {
            setErrors(prev => ({ ...prev, new: rowErrors }));
            return;
        };

        try {
            const payload = {
                name: newItem.name,
                price: parseFloat(Number(newItem.price).toFixed(2)),
                display: newItem.display,
                category: newItem.category
            }
            const response = await api.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`, payload);
            const created = response.data;
            
            let createdCategories = [];
            if (Array.isArray(created.categories) && created.categories.length) {
                createdCategories = created.categories;
            } else if (created.Category) {
                createdCategories = [created.Category];
            } else if (created.category && typeof created.category === 'string') {
                createdCategories = [{ name: created.category }];
            }

            const normalised = {
                ...created,
                categories: createdCategories,
                category: (createdCategories[0] && createdCategories[0].name) || created.category || newItem.category
            }
            setItems(prev => [normalised, ...prev])
            setNewItem(null);
            setErrors(prev => {
                const copy = { ...prev };
                delete copy.new;
                return copy;
            })
            } catch (err) {
            console.error('Failed to create item', err);
            alert('Failed to create item. See console for details.');
        };
    };

    const startNewItem = () => {
        setNewItem({
            name: '',
            display: '',
            price: '',
            category: ''
        });
    };

    const cancelNewItem = () => {
        setNewItem(null);
        setErrors(prev => {
            const copy = { ...prev }
            delete copy.new
            return copy
        });
    };

    const toggleSort = (column) => {
        if (sortBy === column) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    }

    const renderCell = (item, field, displayValue) => {
        const id = item.id;
        const isEditing = editing[id] && editing[id].hasOwnProperty(field);
        const editValue = isEditing ? editing[id][field] : undefined;
        const fieldError = (errors[id] && errors[id][field]) || null;

        return (
            <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '160px' }} onClick={() => !isEditing && startEdit(id, field, item[field])}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {field === 'category' ? (
                            <select 
                                value={editValue || ''}
                                onChange={(e) => changeEdit(id, field, e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value=''>-- Select Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                            value={editValue}
                            onChange={(e) => changeEdit(id, field, e.target.value)}
                            style={{ flex: 1 }}
                            maxLength={field === 'display' ? 20 : field === 'name' ? 50 : field === 'category' ? 30 : undefined}
                            type={field === 'price' ? 'number' : 'text'}
                            step={field === 'price' ? '0.01' : undefined}
                            />
                        )}
                        {fieldError && <small style={{ color: 'darkred' }}>{fieldError}</small>}
                    </div>
                ) : (
                    <div style={{ cursor: 'pointer' }}>{displayValue}</div>
                )}
            </td>
        );
    };

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'id') {
            return sortDir === 'asc' ? (a.id - b.id) : (b.id - a.id);
        }        
        const ca = (a.category || '').toLowerCase()
        const cb = (b.category || '').toLowerCase()
        if (ca < cb) return sortDir === 'asc' ? -1 : 1
        if (ca > cb) return sortDir === 'asc' ? 1 : -1
        return a.id - b.id
    });

    const sortIndicator = (column) => {
        if (sortBy !== column) return '';
        return sortDir === 'asc' ? ' ▲' : ' ▼';
    }

    return (
        <div className='dashboard items'>
            <DashNav handlePageChange={handlePageChange} activePage={activePage} />
            <div className='container' style={{ paddingTop: 16 }}>
                <h1>Options</h1>
                <p>View and edit options. Click any field to edit, a confirm button will appear to save.</p>

                <table className='table' style={{ backgroundColor: '#f8f9fa', border: '2px solid', width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 80, cursor: 'pointer' }} onClick={() => toggleSort('id')}>ID{sortIndicator('id')}</th>
                            <th style={{ cursor: 'pointer'}} onClick={() => toggleSort('category')}>Category{sortIndicator('category')}</th>
                            <th>Display (max 20)</th>
                            <th>Name (max 50)</th>
                            <th>Price</th>
                            <th style={{ width: 220 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>Loading...</td></tr>
                        ) : (
                            sortedItems.map(item => (
                                <tr key={item.id}>
                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.id}</td>
                                    {renderCell(item, 'category', (item.category && item.category.name) || item.category || (item.Category && item.Category.name) || '')}
                                    {renderCell(item, 'display', item.display)}
                                    {renderCell(item, 'name', item.name)}
                                    {renderCell(item, 'price', String(item.price))}


                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                        {rowDirty[item.id] ? (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button 
                                                    className='btn btn-sm btn-primary' 
                                                    disabled={saving[item.id] || !!(errors[item.id] && Object.values(errors[item.id]).some(Boolean))} 
                                                    onClick={() => saveRow(item.id)}
                                                >
                                                    {saving[item.id] ? 'Saving...' : 'Confirm'}
                                                </button>
                                                <button className='btn btn-sm btn-secondary' onClick={() => cancelEdit(item.id)} disabled={saving[item.id]}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className='btn btn-sm btn-outline-danger' onClick={async () => {
                                                    if (!window.confirm('Delete this option?')) return
                                                    try {
                                                        await api.delete(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options/${item.id}`)
                                                        setItems(prev => prev.filter(it => it.id !== item.id))
                                                    } catch (e) {
                                                        console.error('Delete failed', e)
                                                        alert('Failed to delete option')
                                                    }
                                                }}>Delete</button>
                                                <button className='btn btn-sm btn-outline-secondary' onClick={() => window.alert(JSON.stringify(item, null, 2))}>View</button>
                                            </div>
                                    )}
                                    </td>
                                </tr>
                            ))
                        )}


                        {/* New option row */}
                        {newItem ? (
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>—</td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <select value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}>
                                        <option value=''>-- Select Category --</option>
                                        {categories.map(cat => <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                    {errors.new && errors.new.category && <div style={{ color: 'darkred' }}>{errors.new.category}</div>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <input value={newItem.display} maxLength={20} onChange={e => setNewItem(prev => ({ ...prev, display: e.target.value }))} />
                                    {errors.new && errors.new.display && <div style={{ color: 'darkred' }}>{errors.new.display}</div>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <input value={newItem.name} maxLength={50} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
                                    {errors.new && errors.new.name && <div style={{ color: 'darkred' }}>{errors.new.name}</div>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <input value={newItem.price} type='number' step='0.01' onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} />
                                    {errors.new && errors.new.price && <div style={{ color: 'darkred' }}>{errors.new.price}</div>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className='btn btn-sm btn-success' onClick={handleCreateNew}  disabled={!!(errors.new && Object.values(errors.new).some(Boolean))}>Create</button>
                                        <button className='btn btn-sm btn-secondary' onClick={cancelNewItem}>Cancel</button>
                                    </div>
                                </td>
                            </tr>
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>
                                        <button className='btn btn-sm btn-primary' onClick={startNewItem}>+ Add new option</button>
                                    </td>
                                </tr>
                        )}


                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DashItems;