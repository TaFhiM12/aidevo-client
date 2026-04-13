import { Building2 } from "lucide-react";

export default function OrgFields({ handleChange }) {
  const fields = [
    { type: "text", name: "contact", placeholder: "Contact Number" },
    { type: "text", name: "website", placeholder: "Website or Facebook Page" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-[#4bbeff] transition-colors">
        <Building2 className="text-gray-400 mr-2" size={18} />
        <input
          type="text"
          name="orgName"
          placeholder="Organization Name"
          onChange={handleChange}
          className="w-full outline-none text-sm"
          required
        />
      </div>

      <select
        name="orgType"
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors"
      >
        <option value="">Select Organization Type</option>
        <option>Club</option>
        <option>NGO</option>
        <option>Department</option>
        <option>Community</option>
      </select>

      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors"
        />
      ))}

      <textarea
        name="mission"
        placeholder="Organization Mission / Description"
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors resize-none"
        rows="3"
      />
    </div>
  );
}