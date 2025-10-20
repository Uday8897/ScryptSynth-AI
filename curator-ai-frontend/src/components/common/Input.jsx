const Input = ({ id, type, placeholder, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-text-secondary">{placeholder}</label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-md bg-background border border-surface focus:outline-none focus:ring-2 focus:ring-primary text-text-main" // <-- ADD text-text-main HERE
      required
    />
  </div>
);

export default Input;