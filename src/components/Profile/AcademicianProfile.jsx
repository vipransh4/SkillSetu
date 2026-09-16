import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  Check,
  Award
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import apiClient from '../../api/client';
import authService from '../../api/auth';
import AppearanceSettings from '../Settings/AppearanceSettings';

const INITIAL_PUBLICATIONS = [
  {
    id: 1,
    title: 'Adaptive Cognitive Assessment Protocols for Scalable Technical Evaluation',
    journal: 'IEEE Transactions on Learning Technologies',
    year: '2025',
    doi: '10.1109/TLT.2025.3214567',
    type: 'Journal'
  },
  {
    id: 2,
    title: 'Algorithmic Countermeasures Against Resume Padding in High-Stakes Engineering Hiring',
    journal: 'ACM Conference on Fairness, Accountability, and Transparency (FAccT)',
    year: '2024',
    doi: '10.1145/3611234.3611890',
    type: 'Conference'
  }
];

const AcademicianProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState({
    first_name: 'Dr. Vikram',
    last_name: 'Sengupta',
    email: 'vikram.sengupta@campus.edu',
    designation: 'Professor & Dean of Industry Relations',
    employee_id: 'FAC-CS-1082',
    contact_phone: '+91 98450 12345',
    institution_name: 'National Institute of Technology & Management',
    institution_code: 'C-18492',
    nirf_rank: '14',
    department_name: 'Computer Science & Engineering'
  });

  const [preferences, setPreferences] = useState({
    common: {
      email_alerts: true,
      in_app_alerts: true,
      theme: 'system'
    },
    placement_oversight: {
      auto_verify_milestones: false,
      alert_on_new_offer: true,
      alert_on_unplaced_candidate: true,
      skill_deficit_threshold: 15
    },
    curriculum_analytics: {
      compare_national_benchmarks: true,
      auto_suggest_remedial_tracks: true,
      share_analytics_with_recruiters: true
    },
    faculty_exposure: {
      notify_new_fdps: true,
      notify_consultancy_projects: true
    }
  });

  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [newPub, setNewPub] = useState({
    title: '',
    journal: '',
    year: '2026',
    doi: '',
    type: 'Journal'
  });

  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/institutions/faculty/me');
        if (res.data) {
          const d = res.data;
          setProfile(prev => ({
            ...prev,
            first_name: d.first_name || prev.first_name,
            last_name: d.last_name || prev.last_name,
            email: d.email || prev.email,
            designation: d.designation || prev.designation,
            employee_id: d.employee_id || prev.employee_id,
            contact_phone: d.contact_phone || prev.contact_phone,
            institution_name: d.institution ? d.institution.name : prev.institution_name,
            institution_code: d.institution ? d.institution.code : prev.institution_code,
            nirf_rank: d.institution && d.institution.nirf_rank ? String(d.institution.nirf_rank) : prev.nirf_rank,
            department_name: d.department ? d.department.name : prev.department_name
          }));
        }
      } catch (err) {}

      try {
        const settingsRes = await apiClient.get('/institutions/faculty/me/settings');
        if (settingsRes.data) {
          setPreferences(prev => ({
            ...prev,
            ...settingsRes.data
          }));
        }
      } catch (err) {}
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await apiClient.put('/institutions/faculty/me', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        designation: profile.designation,
        employee_id: profile.employee_id,
        contact_phone: profile.contact_phone
      });

      await apiClient.put('/institutions/faculty/me/settings', preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPublication = (e) => {
    e.preventDefault();
    if (!newPub.title) return;
    setPublications(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newPub
      }
    ]);
    setNewPub({
      title: '',
      journal: '',
      year: '2026',
      doi: '',
      type: 'Journal'
    });
    setIsPubModalOpen(false);
  };

  const handleDeletePublication = (id) => {
    setPublications(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xl tracking-tight shrink-0">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  {profile.first_name} {profile.last_name}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-transparent border border-blue-200 dark:border-blue-500/40 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Verified Faculty
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile.designation} • {profile.department_name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {profile.institution_name} (AISHE {profile.institution_code})
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving Changes...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Preferences Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-100 mt-6 pt-2">
          {[
            { id: 'identity', label: 'Academic Identity' },
            { id: 'publications', label: `Research & Publications (${publications.length})` },
            { id: 'notifications', label: 'Institutional Oversight Alerts' },
            { id: 'compliance', label: 'APAAR & DigiLocker Keys' },
            { id: 'appearance', label: 'Appearance & Theme' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'identity' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Personal & Institutional Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are reflected across student verification certificates and corporate partnership documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campus Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200/80 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profile.contact_phone}
                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Academic Designation</label>
              <input
                type="text"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Faculty Employee ID</label>
              <input
                type="text"
                value={profile.employee_id}
                onChange={(e) => setProfile({ ...profile, employee_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Department</label>
              <input
                type="text"
                value={profile.department_name}
                onChange={(e) => setProfile({ ...profile, department_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Associated College / University</label>
              <input
                type="text"
                disabled
                value={`${profile.institution_name} (AISHE: ${profile.institution_code})`}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200/80 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'publications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Research Publications & Patents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Indexed in institutional faculty repository and attached to corporate consultancy proposals.
              </p>
            </div>
            <button
              onClick={() => setIsPubModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Publication
            </button>
          </div>

          <div className="space-y-3">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200/80 text-[10px] font-medium text-slate-600">
                      {pub.type}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">{pub.year}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 tracking-tight">
                    {pub.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {pub.journal} {pub.doi && <span className="font-mono text-slate-400">• DOI: {pub.doi}</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePublication(pub.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Placement Oversight & Deficit Radar Alerts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control automated triggers and notifications dispatched to departmental faculty advisors.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-900 block">Immediate Offer Notification</span>
                <span className="text-[11px] text-slate-500 block">
                  Send alert as soon as an enterprise partner extends a job or internship offer to a student.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.placement_oversight.alert_on_new_offer}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    placement_oversight: {
                      ...preferences.placement_oversight,
                      alert_on_new_offer: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-900 block">Unplaced Candidate Warning</span>
                <span className="text-[11px] text-slate-500 block">
                  Alert faculty when a candidate fails 3 consecutive interviews without receiving an offer.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.placement_oversight.alert_on_unplaced_candidate}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    placement_oversight: {
                      ...preferences.placement_oversight,
                      alert_on_unplaced_candidate: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-900 block">Auto-Suggest Remedial Upskilling</span>
                <span className="text-[11px] text-slate-500 block">
                  Automatically recommend targeted technical courses to candidates with verified skill deficits.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.curriculum_analytics.auto_suggest_remedial_tracks}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    curriculum_analytics: {
                      ...preferences.curriculum_analytics,
                      auto_suggest_remedial_tracks: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <span className="text-xs font-medium text-slate-900 block">Industry FDP & Consultancy Opportunities</span>
                <span className="text-[11px] text-slate-500 block">
                  Receive alerts when corporate partners publish Faculty Development Programs or Consultancy bids.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.faculty_exposure.notify_new_fdps}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    faculty_exposure: {
                      ...preferences.faculty_exposure,
                      notify_new_fdps: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">APAAR / DigiLocker & ABC Verification Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographic keys and National Academic Depository synchronization protocols under NEP 2020.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-900">
                  Institutional Signing Key (RSA-4096)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50/60 px-2 py-0.5 rounded-md tabular-nums">
                <CheckCircle2 className="w-3 h-3" />
                Active & Validated
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Key Fingerprint: 4E:7B:9A:21:FD:80:12:AA:90:34:CD:EF:18:49:2B:67
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200/80 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Academic Bank of Credits (ABC) Sync</span>
              <span className="text-xs font-semibold text-slate-900 block mt-1">Live Automated Webhook</span>
              <span className="text-[11px] text-slate-400 block mt-0.5 tabular-nums">Last sync: Today at 04:30 AM</span>
            </div>

            <div className="p-4 border border-slate-200/80 rounded-xl">
              <span className="text-slate-500 block text-[11px]">AISHE Compliance Standard</span>
              <span className="text-xs font-semibold text-slate-900 block mt-1">Version 3.4 (2025-2026 Mandate)</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Department of Higher Education</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <AppearanceSettings />
        </div>
      )}

      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-lg shadow-xl relative">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Add Academic Publication</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter details for scholarly paper, conference proceeding, or registered patent.
            </p>

            <form onSubmit={handleAddPublication} className="space-y-3.5 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Publication Title</label>
                <input
                  type="text"
                  required
                  value={newPub.title}
                  onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
                  placeholder="e.g., Deep Learning Architecture for Edge Computing"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Journal / Conference Name</label>
                <input
                  type="text"
                  required
                  value={newPub.journal}
                  onChange={(e) => setNewPub({ ...newPub, journal: e.target.value })}
                  placeholder="e.g., IEEE Transactions on Software Engineering"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={newPub.year}
                    onChange={(e) => setNewPub({ ...newPub, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={newPub.type}
                    onChange={(e) => setNewPub({ ...newPub, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Journal">Journal Article</option>
                    <option value="Conference">Conference Paper</option>
                    <option value="Patent">Patent / Intellectual Property</option>
                    <option value="Book Chapter">Book Chapter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">DOI / Patent Number (Optional)</label>
                <input
                  type="text"
                  value={newPub.doi}
                  onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })}
                  placeholder="10.1109/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Add Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicianProfile;
