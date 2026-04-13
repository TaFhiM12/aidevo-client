import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Loader2, Edit3 } from 'lucide-react';

const ArrayManager = ({
    items = [],
    onUpdate,
    placeholder = "Add new item...",
    title,
    description,
    maxItems,
    allowEmpty = false,
    loading = false,
    color = 'blue'
}) => {
    const [localItems, setLocalItems] = useState(items || []);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        setLocalItems(items || []);
    }, [items]);

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            button: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
            icon: 'text-blue-600'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            button: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
            icon: 'text-red-600'
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            button: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
            icon: 'text-green-600'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            button: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
            icon: 'text-purple-600'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            button: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
            icon: 'text-orange-600'
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            button: 'from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
            icon: 'text-yellow-600'
        }
    };

    const currentColor = colorClasses[color] || colorClasses.blue;

    const handleAdd = () => {
        if (maxItems && localItems.length >= maxItems) {
            return;
        }
        const newItems = [...localItems, ""];
        setLocalItems(newItems);
        setEditingIndex(newItems.length - 1);
        setEditValue("");
    };

    const startEdit = (index) => {
        setEditingIndex(index);
        setEditValue(localItems[index] || "");
    };

    const handleEdit = (index, value) => {
        const newItems = localItems.map((item, i) => i === index ? value : item);
        setLocalItems(newItems);
    };

    const handleSaveEdit = () => {
        if (editValue.trim() || allowEmpty) {
            const newItems = localItems.map((item, i) => i === editingIndex ? editValue.trim() : item);
            setLocalItems(newItems);
        }
        setEditingIndex(null);
        setEditValue("");
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue("");
    };

    const handleRemove = (index) => {
        const newItems = localItems.filter((_, i) => i !== index);
        setLocalItems(newItems);
    };

    const handleSave = async () => {
        const filteredItems = allowEmpty ? localItems : localItems.filter(item => item.trim() !== "");
        await onUpdate(filteredItems);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAdd}
                        disabled={loading || (maxItems && localItems.length >= maxItems)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Add New
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-3 py-2 bg-gradient-to-r ${currentColor.button} text-white rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 text-sm`}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Save
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {localItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 p-3 ${currentColor.bg} rounded-lg border ${currentColor.border} group transition-all`}
                    >
                        <div className="flex-1 min-w-0">
                            {editingIndex === index ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                                    placeholder={placeholder}
                                    autoFocus
                                />
                            ) : (
                                <div 
                                    className="cursor-pointer px-3 py-2 rounded-lg hover:bg-white/50 transition-all"
                                    onClick={() => startEdit(index)}
                                >
                                    <p className={`${!item ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                                        {item || placeholder}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingIndex === index ? (
                                <>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-all"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => startEdit(index)}
                                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-all"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}

                {localItems.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">No items added yet.</p>
                        <button
                            onClick={handleAdd}
                            className="mt-2 text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 mx-auto text-sm"
                        >
                            <Plus size={16} />
                            Add your first item
                        </button>
                    </div>
                )}

                {maxItems && localItems.length >= maxItems && (
                    <p className="text-sm text-gray-500 text-center">
                        Maximum {maxItems} items allowed
                    </p>
                )}
            </div>
        </div>
    );
};

export default ArrayManager;