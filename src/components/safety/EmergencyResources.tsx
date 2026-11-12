import React from 'react';
import { ShieldAlert, PhoneCall, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const EmergencyResources: React.FC = () => {
  const hotlines = [
    {
      title: 'National Emergency Response Support',
      number: '112',
      description: 'Single emergency number across India for Police, Fire, and Medical assistance.',
      category: 'Immediate Police & Emergency',
      color: 'rose',
    },
    {
      title: 'National Women Helpline',
      number: '1091 / 181',
      description: '24/7 dedicated support and transit safety intervention for women travellers.',
      category: 'Women Transit Safety',
      color: 'amber',
    },
    {
      title: 'Indian Railways Security (RPF)',
      number: '139',
      description: 'Instant railway police assistance, berth security & medical emergencies on trains.',
      category: 'Train & Platform Security',
      color: 'teal',
    },
    {
      title: 'National Highway Helpline',
      number: '1033',
      description: 'Roadside emergency response, highway patrol, and towing across all National Highways.',
      category: 'Highway & Road Travel',
      color: 'indigo',
    },
    {
      title: 'Emergency Medical & Ambulance',
      number: '108',
      description: 'Direct medical dispatch and first responder ambulance coordination.',
      category: 'Medical Services',
      color: 'emerald',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 text-left">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Official Emergency Hotlines & Protocols
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Access direct contact numbers for national law enforcement and official transit response authorities.
        </p>
      </div>

      {/* Critical Explicit Disclaimer as requested */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-rose-950">
          <p className="font-bold text-rose-900 uppercase tracking-wide">
            Critical Safety Notice
          </p>
          <p className="leading-relaxed">
            <strong>RideAlong is not an emergency dispatch provider and does not contact emergency services on your behalf.</strong> If you feel in immediate danger, encounter illegal behavior, or require urgent medical or police intervention, call <strong>112</strong> or the local authorities immediately.
          </p>
        </div>
      </div>

      {/* Hotline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {hotlines.map((h, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {h.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  Dial {h.number}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{h.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {h.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-center justify-between">
              <a
                href={`tel:${h.number.split('/')[0].trim()}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Helpline ({h.number})
              </a>
              <span className="text-[10px] text-slate-400">Toll-free / 24x7</span>
            </div>
          </div>
        ))}
      </div>

      {/* RideAlong Safe Transit Commandments */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
        <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          The RideAlong Safety Creed
        </h4>
        <ul className="text-xs text-teal-900/90 space-y-1 list-disc list-inside leading-relaxed">
          <li>Always meet travel companions at public station waiting halls or ticket barriers first.</li>
          <li>Never transfer money outside of verified transit ticket booking services.</li>
          <li>Keep your phone charged and ensure at least one trusted contact has your live itinerary.</li>
          <li>Trust your instincts. If a companion makes you uncomfortable, cancel the plan without hesitation.</li>
        </ul>
      </div>
    </div>
  );
};
