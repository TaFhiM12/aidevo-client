import React, { useState, useEffect } from 'react';
import { Edit3, X, Loader2, CheckCircle } from 'lucide-react';

const InlineEditField = ({
    value,
    onSave,
    className = "",
    placeholder = "Click to edit...",
    multiline = false,
    type = "text",
    options = [],
    loading = false,
    icon: Icon,
    label,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || "");

    useEffect(() => {
        setTempValue(value || "");
    }, [value]);

    const handleSave = async () => {
        if (tempValue.trim() !== (value || "").trim()) {
            const success = await onSave(tempValue.trim());
            if (success) {
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setTempValue(value || "");
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === "Escape") {
            handleCancel();
        }
    };

    return (
        <div className="relative">
            {label && (
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {label}
                </label>
            )}

            {isEditing ? (
                <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-start gap-3">
                        {Icon && (
                            <Icon size={20} className="text-blue-500 mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            {type === "select" ? (
                                <select
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all"
                                    autoFocus
                                >
                                    <option value="">Select an option</option>
                                    {options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : type === "date" ? (
                                <input
                                    type="date"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all"
                                    autoFocus
                                />
                            ) : multiline ? (
                                <textarea
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`${className} w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none resize-vertical transition-all`}
                                    placeholder={placeholder}
                                    rows={4}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`${className} w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all`}
                                    placeholder={placeholder}
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 rounded-lg hover:bg-gray-100"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`${className} group cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all p-4 border-2 border-transparent hover:border-blue-200 ${
                        !value ? "text-gray-400 italic" : "text-gray-900"
                    }`}
                    onClick={() => setIsEditing(true)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            {Icon && (
                                <Icon
                                    size={20}
                                    className="text-blue-500 mt-0.5 flex-shrink-0"
                                />
                            )}
                            <span className="text-base leading-relaxed">
                                {value || placeholder}
                            </span>
                        </div>
                        <Edit3
                            size={18}
                            className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-blue-500 mt-0.5"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineEditField;