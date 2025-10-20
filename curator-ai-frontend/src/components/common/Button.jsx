const Button = ({ children, type = 'submit', isLoading = false }) => (
  <button
    type={type}
    disabled={isLoading}
    className="w-full py-3 font-bold rounded-md bg-primary text-text-main hover:bg-violet-500 transition-colors disabled:bg-violet-800 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Loading...' : children}
  </button>
);

export default Button;