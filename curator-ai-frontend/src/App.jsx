import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    // This div creates the cool film grain overlay effect
    <div className="relative min-h-screen bg-background before:content-[''] before:fixed before:inset-0 before:bg-[url('/src/assets/film-grain.png')] before:opacity-5 before:pointer-events-none">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
          },
        }}
      />
      <AppRoutes />
    </div>
  );
}

export default App;