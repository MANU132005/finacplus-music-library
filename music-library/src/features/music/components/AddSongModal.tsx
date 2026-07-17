import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { SongFormData } from '../../../types/song';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SongFormData) => void;
  isSubmitting: boolean;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SongFormData>({
    defaultValues: {
      title: '',
      artist: '',
      album: '',
      year: new Date().getFullYear(),
    },
  });

  // Focus Trapping and Escape Key handler for Accessibility (WCAG 2.1 compliant)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus first input on open
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const firstInput = modalRef.current.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: SongFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      ref={modalRef}
    >
      {/* Backdrop with fade-in transition */}
      <div
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Dialog Box with scale-up transition */}
      <div className="relative transform overflow-hidden rounded-3xl bg-white p-6 text-left shadow-soft-lg transition-all w-full max-w-md border border-slate-100 animate-scaleIn z-10">
        {/* Hidden screen-reader description for screen-readers */}
        <p id="modal-description" className="sr-only">
          This form allows you to register a new song into the Music Library registry.
        </p>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 id="modal-title" className="text-lg font-bold text-slate-800 tracking-tight">
            Add New Song
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 p-1.5 hover:bg-slate-50 rounded-xl transition-all duration-200 focus:outline-none"
            aria-label="Close modal dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          {/* Song Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
            >
              Song Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Song title is required' })}
              placeholder="e.g. Stairway to Heaven"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${
                errors.title
                  ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800'
              }`}
              aria-required="true"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="text-xs text-red-500 font-semibold mt-1 block">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Artist */}
          <div>
            <label
              htmlFor="artist"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
            >
              Artist Name
            </label>
            <input
              id="artist"
              type="text"
              {...register('artist', { required: 'Artist name is required' })}
              placeholder="e.g. Led Zeppelin"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${
                errors.artist
                  ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800'
              }`}
              aria-required="true"
              aria-invalid={!!errors.artist}
            />
            {errors.artist && (
              <span className="text-xs text-red-500 font-semibold mt-1 block">
                {errors.artist.message}
              </span>
            )}
          </div>

          {/* Album */}
          <div>
            <label
              htmlFor="album"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
            >
              Album Name
            </label>
            <input
              id="album"
              type="text"
              {...register('album', { required: 'Album name is required' })}
              placeholder="e.g. Led Zeppelin IV"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${
                errors.album
                  ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800'
              }`}
              aria-required="true"
              aria-invalid={!!errors.album}
            />
            {errors.album && (
              <span className="text-xs text-red-500 font-semibold mt-1 block">
                {errors.album.message}
              </span>
            )}
          </div>

          {/* Release Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
            >
              Release Year
            </label>
            <input
              id="year"
              type="number"
              {...register('year', {
                required: 'Release year is required',
                valueAsNumber: true,
                validate: {
                  isNumeric: (value) => !isNaN(value) || 'Year must be a number',
                  validRange: (value) =>
                    (value >= 1800 && value <= 2100) ||
                    'Please enter a valid year between 1800 and 2100',
                },
              })}
              placeholder="e.g. 1971"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${
                errors.year
                  ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800'
              }`}
              aria-required="true"
              aria-invalid={!!errors.year}
            />
            {errors.year && (
              <span className="text-xs text-red-500 font-semibold mt-1 block">
                {errors.year.message}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all focus:outline-none hover:scale-[1.01]"
              aria-label="Cancel and close form"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-950 text-white font-semibold rounded-xl text-sm hover:bg-slate-850 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-2 focus:outline-none"
              aria-label="Submit new song registry"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Song</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
