import React from 'react';
import { Modal } from './Modal';
import { ScoreBreakdown, Traveller } from '../../types';
import { ShieldAlert, Route, Compass, Heart, Languages, Users2 } from 'lucide-react';
import { Button } from './Button';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  traveller: Traveller;
  score: ScoreBreakdown;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  traveller,
  score,
}) => {
  const getScoreBadgeColor = (total: number) => {
    if (total >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (total >= 70) return 'text-teal-700 bg-teal-50 border-teal-300';
    return 'text-amber-700 bg-amber-50 border-amber-300';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Explainable Compatibility Breakdown" maxWidth="lg">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Match with {traveller.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated purely from travel schedules, route corridors & verified preferences.
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl border font-bold text-lg ${getScoreBadgeColor(
              score.totalScore
            )}`}
          >
            {score.totalScore}%
          </div>
        </div>

        {/* 5 Explainable Categories */}
        <div className="space-y-4">
          {/* 1. Route & Schedule (40%) */}
          <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Route className="w-4 h-4 text-teal-600" />
                Route & Schedule Alignment (40%)
              </span>
              <span className="font-semibold text-slate-900">
                {score.routeScheduleScore} / 40 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score.routeScheduleScore / 40) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{score.routeMatchDetails}</p>
          </div>

          {/* 2. Travel Preferences (25%) */}
          <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Compass className="w-4 h-4 text-teal-600" />
                Travel Style & Preferences (25%)
              </span>
              <span className="font-semibold text-slate-900">
                {score.preferencesScore} / 25 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score.preferencesScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{score.preferencesMatchDetails}</p>
          </div>

          {/* 3. Interests (15%) */}
          <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Heart className="w-4 h-4 text-teal-600" />
                Shared Interests (15%)
              </span>
              <span className="font-semibold text-slate-900">
                {score.interestsScore} / 15 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score.interestsScore / 15) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {score.sharedInterests.length > 0 ? (
                score.sharedInterests.map((interest, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200/60 px-2 py-0.5 rounded-md"
                  >
                    ✓ {interest}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No direct interest overlap</span>
              )}
            </div>
          </div>

          {/* 4. Languages (10%) */}
          <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Languages className="w-4 h-4 text-teal-600" />
                Language Compatibility (10%)
              </span>
              <span className="font-semibold text-slate-900">
                {score.languagesScore} / 10 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score.languagesScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              Shared languages: {score.sharedLanguages.join(', ') || 'English (Universal fallback)'}
            </p>
          </div>

          {/* 5. Group Size (10%) */}
          <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Users2 className="w-4 h-4 text-teal-600" />
                Group Cohort Alignment (10%)
              </span>
              <span className="font-semibold text-slate-900">
                {score.groupSizeScore} / 10 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score.groupSizeScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{score.groupSizeDetails}</p>
          </div>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">Safety Architecture Notice</p>
            <p className="leading-relaxed">
              {score.disclaimer} Always inspect traveller verification badges, conduct an in-app
              verification chat, and register your trusted emergency contacts before departing.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
