const InputField = ({ label, icon: Icon, type, name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="text-gray-700 text-sm font-medium mb-2 block">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] outline-none transition-all placeholder-gray-500"
        />
      </div>
    </div>
  );
};

export default InputField;