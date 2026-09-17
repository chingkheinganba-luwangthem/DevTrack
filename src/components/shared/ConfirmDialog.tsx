'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
  // Specific support for project deletion with work logs
  hasWorkLogs?: boolean;
  onArchive?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  hasWorkLogs = false,
  onArchive,
}) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="gap-2">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {hasWorkLogs && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Notice: Project has existing work logs</p>
            <p>
              Deleting it will permanently remove all related timesheet entries and reports. We recommend archiving it instead so your historical records remain intact.
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel} className="rounded-xl">
            {cancelLabel}
          </Button>

          {hasWorkLogs && onArchive && (
            <Button
              variant="secondary"
              onClick={() => {
                onArchive();
                onOpenChange(false);
              }}
              className="rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium"
            >
              Archive Project (Recommended)
            </Button>
          )}

          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-xl font-medium"
          >
            {hasWorkLogs ? 'Delete Project & Work Logs' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
