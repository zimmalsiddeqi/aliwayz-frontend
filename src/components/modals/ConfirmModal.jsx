import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="grid grid-cols-2 gap-3 mt-4">
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
