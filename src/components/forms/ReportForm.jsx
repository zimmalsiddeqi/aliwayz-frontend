import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createReportSchema } from '@lib/validators';
import ReportService from '@api/services/report.service';
import Select from '@components/ui/Select';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';
import { REPORT_REASONS } from '@utils/constants';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function ReportForm({ targetType, targetId, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:     zodResolver(createReportSchema),
    defaultValues: { target_type: targetType, target_id: targetId, reason: '', description: '' },
  });

  const mutation = useMutation({
    mutationFn: ReportService.create,
    onSuccess:  () => {
      toast.success('Report submitted. Our team will review it.');
      onSuccess?.();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <input type="hidden" {...register('target_type')} />
      <input type="hidden" {...register('target_id')} />

      <Select
        label="Reason"
        placeholder="Select a reason"
        options={REPORT_REASONS}
        error={errors.reason?.message}
        {...register('reason')}
      />

      <Textarea
        label="Additional details (optional)"
        placeholder="Describe the issue..."
        maxLength={500}
        error={errors.description?.message}
        {...register('description')}
      />

      <Button type="submit" fullWidth isLoading={mutation.isPending} loadingText="Submitting...">
        Submit Report
      </Button>
    </form>
  );
}