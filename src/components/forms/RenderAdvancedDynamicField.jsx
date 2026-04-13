// components/forms/renderAdvancedDynamicField.jsx
import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const RenderAdvancedDynamicField = ({ field, value, onChange, error }) => {
  // All hooks at the top level - ALWAYS called in the same order
  const [isOpen, setIsOpen] = useState(false);
  
  const commonClass = "w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  const handleMultiSelectChange = (option) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];
    
    onChange({
      target: {
        name: field.name,
        value: newValues
      }
    });
  };

  // Now render based on type (no hooks after this point)
  switch (field.type) {
    case "select":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            className={commonClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "multiselect":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <div 
              className="border rounded-xl px-4 py-3 bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex flex-wrap gap-2">
                {Array.isArray(value) && value.length > 0 ? (
                  value.map((item) => (
                    <span key={item} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMultiSelectChange(item);
                        }}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Select options...</span>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {field.options?.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Array.isArray(value) && value.includes(option)}
                      onChange={() => handleMultiSelectChange(option)}
                      className="w-4 h-4 text-blue-500 rounded"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            rows={4}
            placeholder={field.placeholder}
            className={commonClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name={field.name}
            checked={Boolean(value)}
            onChange={onChange}
            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
          />
          <label className="font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );

    case "url":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="url"
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={field.placeholder}
            className={commonClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "datetime-local":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="datetime-local"
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            className={commonClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className={commonClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.type || "text"}
            name={field.name}
            value={value ?? ""}
            onChange={onChange}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className={commonClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
  }
};

export default RenderAdvancedDynamicField;