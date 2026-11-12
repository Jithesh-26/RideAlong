import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Traveller } from '../../types';
import { useSafety } from '../../context/SafetyContext';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: Traveller | null;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { reportUser, blockUser } = useSafety();
  const [reason, setReason] = useState('inappropriate_behavior');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await reportUser(targetUser.id, reason, details);
      if (alsoBlock) {
        await blockUser(targetUser.id);
      }
      setSubmittedMessage(res.message);
      setTimeout(() => {
        setSubmittedMessage('');
        setDetails('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Report failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetUser.name}`} maxWidth="md">
      {submittedMessage ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Report Successfully Filed</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">{submittedMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              We take safety violations seriously. Reports are reviewed promptly by our Trust & Safety
              team. False reporting is subject to platform suspension.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-600"
            >
              <option value="inappropriate_behavior">Inappropriate / Disrespectful Behavior</option>
              <option value="unsolicited_advances">Unsolicited Dating / Romantic Advances</option>
              <option value="safety_concern">Immediate Transit Safety Concern</option>
              <option value="impersonation">Identity Impersonation / Fake Profile</option>
              <option value="spam">Spam / Commercial Solicitation</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Incident Details
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Please provide specific context, dates, or messages that occurred..."
              className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={e => setAlsoBlock(e.target.checked)}
              className="rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
            />
            <span>Also immediately block this user from contacting me</span>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
