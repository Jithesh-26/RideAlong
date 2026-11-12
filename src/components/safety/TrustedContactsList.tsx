import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { UserCheck, Plus, Trash2, Bell, Phone } from 'lucide-react';

export const TrustedContactsList: React.FC = () => {
  const { trustedContacts, addTrustedContact, deleteTrustedContact } = useSafety();
  const { currentUser } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [notifyOnTripStart, setNotifyOnTripStart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await addTrustedContact({
        userId: currentUser.id,
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        notifyOnTripStart,
      });
      setName('');
      setPhone('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Trusted Emergency Circle
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            These contacts can automatically receive your live trip itinerary and safety check-ins.
          </p>
        </div>
        {!isAdding && (
          <Button
            variant="mint"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdding(true)}
          >
            Add Contact
          </Button>
        )}
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Contact Full Name"
              placeholder="e.g. Meera Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98401 23456"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-600"
              >
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Parent">Parent</option>
                <option value="Spouse/Partner">Spouse/Partner</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnTripStart}
                onChange={e => setNotifyOnTripStart(e.target.checked)}
                className="rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
              />
              <span>Send SMS / Link alert whenever I begin a scheduled journey</span>
            </label>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Contact
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {trustedContacts.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Trusted Contacts Added Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add at least one family member or friend to unlock verified safety itinerary broadcasts.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setIsAdding(true)}
            >
              Add First Contact
            </Button>
          </div>
        ) : (
          trustedContacts.map(contact => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-teal-100/80 text-teal-800 font-bold flex items-center justify-center text-sm">
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/50 font-medium">
                      {contact.relationship}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {contact.phone}
                    </span>
                    {contact.notifyOnTripStart && (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <Bell className="w-3 h-3" />
                        Auto-alerts active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteTrustedContact(contact.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
