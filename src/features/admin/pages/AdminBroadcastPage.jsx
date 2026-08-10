import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Send, BellRing, CheckCircle, Users } from 'lucide-react';
import AdminService from '@api/services/admin.service';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import PageHeader from '@components/common/PageHeader';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');
  const [sent, setSent]   = useState(false);
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: () =>
      AdminService.sendBroadcast({
        title: title.trim(),
        body:  body.trim(),
      }),
    onSuccess: (res) => {
      setResult(res.data);
      setSent(true);
      toast.success('Broadcast sent!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleReset = () => {
    setTitle('');
    setBody('');
    setSent(false);
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Broadcast — Admin — Aliwayz</title>
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        <PageHeader
          title="Broadcast Notification"
          subtitle="Send push notification to all users"
        />

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center space-y-4">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
              >
                <CheckCircle
                  size={32}
                  style={{ color: 'var(--color-success)' }}
                />
              </div>
              <h3
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Broadcast Sent!
              </h3>
              {result && (
                <div
                  className="flex justify-center gap-6 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                      {result.success || 0}
                    </p>
                    <p className="text-xs">Delivered</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-error)' }}>
                      {result.failed || 0}
                    </p>
                    <p className="text-xs">Failed</p>
                  </div>
                </div>
              )}
              <Button onClick={handleReset} variant="outline">
                Send Another
              </Button>
            </Card>
          </motion.div>
        ) : (
          <Card className="p-6 space-y-5">
            {/* Preview */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                }}
              >
                <BellRing size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {title || 'Notification Title'}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {body || 'Your message will appear here...'}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Just now · Aliwayz
                </p>
              </div>
            </div>

            <Input
              label="Title"
              placeholder="Important Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            <Textarea
              label="Message"
              placeholder="Write your message to all users..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
            />

            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{
                backgroundColor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.15)',
                color: 'var(--color-warning)',
              }}
            >
              <Users size={14} className="flex-shrink-0" />
              <span>
                This will be sent to ALL active users with push
                notifications enabled.
              </span>
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={!title.trim() || !body.trim()}
              isLoading={mutation.isPending}
              loadingText="Sending..."
              leftIcon={<Send size={16} />}
              onClick={() => mutation.mutate()}
            >
              Send Broadcast
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}