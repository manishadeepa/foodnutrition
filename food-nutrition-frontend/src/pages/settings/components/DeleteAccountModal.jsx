import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import DeleteAccountModal from './DeleteAccountModal';

const AccountManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDataExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      const mockData = {
        profile: {
          name: 'John Doe',
          email: 'user@foodnutrition.ai',
          joinDate: '2026-01-15'
        },
        dietaryPreferences: {
          vegetarian: false,
          vegan: false,
          glutenFree: true
        },
        analysisHistory: [
          { date: '2026-02-08', foodItem: 'Grilled Chicken Salad', calories: 350 },
          { date: '2026-02-07', foodItem: 'Salmon with Vegetables', calories: 420 }
        ]
      };

      const dataStr  = JSON.stringify(mockData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url  = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `foodnutrition-data-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-h3 font-heading text-foreground mb-1">Account Management</h2>
        <p className="text-sm text-muted-foreground">Manage your account data and settings</p>
      </div>

      {/* Export Data */}
      <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="Download" size={22} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h3 className="text-h5 font-heading text-foreground mb-1">Export Your Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download a copy of your personal data including profile information, dietary preferences, and nutrition analysis history.
            </p>
            {exportSuccess && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15">
                  <Icon name="CheckCircle" size={14} color="var(--color-success)" />
                </div>
                <p className="text-sm font-medium text-success">Data exported successfully!</p>
              </div>
            )}
            <Button onClick={handleDataExport} loading={isExporting} variant="outline" iconName="Download" iconPosition="left">
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="Shield" size={22} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h3 className="text-h5 font-heading text-foreground mb-1">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
            </p>
            <div className="space-y-2.5">
              {[
                'End-to-end encryption enabled',
                'Two-factor authentication available',
                'GDPR compliant data handling',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Icon name="Check" size={13} color="var(--color-success)" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-error/20 bg-error/5 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-error mb-4">Danger Zone</p>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10">
            <Icon name="AlertTriangle" size={22} color="var(--color-error)" />
          </div>
          <div className="flex-1">
            <h3 className="text-h5 font-heading text-error mb-1">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button onClick={() => setShowDeleteModal(true)} variant="destructive" iconName="Trash2" iconPosition="left">
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
};

export default AccountManagement;