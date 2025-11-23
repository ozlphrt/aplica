/**
 * Modal Component
 * Glassmorphic modal dialog for confirmations
 */
import { useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';

export function Modal({ isOpen, onClose, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, variant = 'danger' }) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Card glassmorphic={true} className="max-w-md w-full">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/80 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

