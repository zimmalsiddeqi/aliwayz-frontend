import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function ConfirmModal({
  isOpen, onClose, onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-3 mt-4">
        <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          fullWidth
          onClick={onConfirm}
          isLoading={isLoading}
          loadingText="Processing..."
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}