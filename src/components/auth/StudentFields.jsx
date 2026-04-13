export default function StudentFields({ handleChange }) {
  const fields = [
    { type: "text", name: "studentId", placeholder: "Student ID" },
    { type: "text", name: "phone", placeholder: "Phone Number" },
    { type: "text", name: "skills", placeholder: "Skills or Interests" }
  ];

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors"
          required={field.required}
        />
      ))}
      
      <select
        name="department"
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors"
      >
        <option value="">Select Department</option>
        <option>CSE</option>
        <option>EEE</option>
        <option>BBA</option>
        <option>LAW</option>
      </select>

      <select
        name="year"
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#4bbeff] outline-none transition-colors"
      >
        <option value="">Select Year / Semester</option>
        <option>1st Year</option>
        <option>2nd Year</option>
        <option>3rd Year</option>
        <option>4th Year</option>
      </select>
    </div>
  );
}