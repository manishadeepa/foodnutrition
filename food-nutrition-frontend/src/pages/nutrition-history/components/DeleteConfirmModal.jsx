import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, foodName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl border border-border max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <Icon name="AlertTriangle" size={32} className="text-error" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-foreground text-center mb-2">
            Delete Analysis?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Are you sure you want to delete the analysis for <span className="font-semibold text-foreground">{foodName}</span>? This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="default"
              onClick={onConfirm}
              iconName="Trash2"
              iconPosition="left"
              iconSize={16}
              fullWidth
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;