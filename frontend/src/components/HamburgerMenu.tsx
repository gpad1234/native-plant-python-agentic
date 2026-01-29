import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HamburgerMenuProps {
  onVisionClick: () => void;
}

export function HamburgerMenu({ onVisionClick }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleVisionClick = () => {
    onVisionClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-white hover:bg-green-600 rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={handleVisionClick}
              className="w-full text-left px-4 py-3 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-3 text-gray-700 hover:text-green-700"
            >
              <span className="text-2xl">📸</span>
              <div>
                <div className="font-semibold">Vision</div>
                <div className="text-sm text-gray-500">Identify plants from photos</div>
              </div>
            </button>

            <a
              href="https://www.inaturalist.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 hover:bg-green-50 rounded-lg transition-colors text-gray-700 hover:text-green-700"
            >
              <span className="text-2xl">🌐</span>
              <div className="mt-1">
                <div className="font-semibold">iNaturalist</div>
                <div className="text-sm text-gray-500">Data source</div>
              </div>
            </a>

            <a
              href="https://github.com/gpad1234/native-plant-python-agentic"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 hover:bg-green-50 rounded-lg transition-colors text-gray-700 hover:text-green-700"
            >
              <span className="text-2xl">💻</span>
              <div className="mt-1">
                <div className="font-semibold">GitHub</div>
                <div className="text-sm text-gray-500">View source code</div>
              </div>
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
