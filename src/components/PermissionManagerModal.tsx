import React from 'react';
import {
  X,
  ShieldCheck,
  Mic,
  Users,
  Phone,
  MessageSquare,
  Calendar,
  Bell,
  MapPin,
  Camera,
  Folder,
  Layers,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { DevicePermissions } from '../types';

interface PermissionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: DevicePermissions;
  setPermissions: React.Dispatch<React.SetStateAction<DevicePermissions>>;
  onClearHistory: () => void;
  onClearMemories: () => void;
  onExportData: () => void;
}

export const PermissionManagerModal: React.FC<PermissionManagerModalProps> = ({
  isOpen,
  onClose,
  permissions,
  setPermissions,
  onClearHistory,
  onClearMemories,
  onExportData,
}) => {
  if (!isOpen) return null;

  const togglePermission = async (key: keyof DevicePermissions) => {
    // If requesting microphone or camera, attempt browser permission
    if (key === 'microphone' && !permissions.microphone) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions((p) => ({ ...p, microphone: true }));
        return;
      } catch {
        alert('Microphone access was denied or not supported by this browser.');
      }
    }

    if (key === 'notifications' && !permissions.notifications) {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        setPermissions((p) => ({ ...p, notifications: res === 'granted' }));
        return;
      }
    }

    if (key === 'location' && !permissions.location) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions((p) => ({ ...p, location: true })),
          () => alert('Location permission denied.')
        );
        return;
      }
    }

    // Toggle software permission status
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  };

  const permissionList: Array<{
    key: keyof DevicePermissions;
    title: string;
    icon: React.ReactNode;
    reason: string;
  }> = [
    {
      key: 'microphone',
      title: 'Microphone & Voice Input',
      icon: <Mic className="w-4 h-4 text-cyan-400" />,
      reason: 'Required for real-time speech-to-text and hands-free voice interaction.',
    },
    {
      key: 'contacts',
      title: 'Contacts & Directory',
      icon: <Users className="w-4 h-4 text-pink-400" />,
      reason: 'Required to look up contact names like "Mom", "Rahul", or "Papa".',
    },
    {
      key: 'phone',
      title: 'Phone & Dialer Integration',
      icon: <Phone className="w-4 h-4 text-emerald-400" />,
      reason: 'Enables launching Android phone calls via tel: schemes upon confirmation.',
    },
    {
      key: 'sms',
      title: 'SMS & Messaging Service',
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
      reason: 'Prepares and sends SMS text messages through native messaging intents.',
    },
    {
      key: 'calendar',
      title: 'Calendar & Scheduling',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      reason: 'Allows querying today’s schedule, adding appointments, and resolving conflicts.',
    },
    {
      key: 'location',
      title: 'Location & Navigation',
      icon: <MapPin className="w-4 h-4 text-rose-400" />,
      reason: 'Used for nearby place search and Google Maps turn-by-turn route calculations.',
    },
    {
      key: 'notifications',
      title: 'Notifications & Alerts',
      icon: <Bell className="w-4 h-4 text-yellow-400" />,
      reason: 'Allows Lyra to deliver alarm triggers, timer countdown alerts, and reminders.',
    },
    {
      key: 'camera',
      title: 'Camera & Media Capture',
      icon: <Camera className="w-4 h-4 text-indigo-400" />,
      reason: 'Required for capturing images for visual AI analysis or launch commands.',
    },
    {
      key: 'files',
      title: 'Files & Document Storage',
      icon: <Folder className="w-4 h-4 text-amber-400" />,
      reason: 'Used to inspect uploaded PDFs, study materials, and export backup files.',
    },
    {
      key: 'overlay',
      title: 'Floating Assistant Overlay',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      reason: 'Displays the floating Lyra avatar widget for quick access across apps.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-5 border border-slate-700 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Android Permissions & Privacy
              </h3>
              <p className="text-[11px] text-slate-400">
                Full transparency into what device resources Lyra can access
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
          {permissionList.map((perm) => {
            const isGranted = permissions[perm.key];
            return (
              <div
                key={perm.key}
                className="glass-card p-3 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-start space-x-3 pr-2">
                  <div className="p-2 rounded-lg bg-slate-800/80 mt-0.5">{perm.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">{perm.title}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isGranted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isGranted ? 'Granted' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{perm.reason}</p>
                  </div>
                </div>

                <button
                  onClick={() => togglePermission(perm.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isGranted
                      ? 'bg-rose-900/40 text-rose-300 hover:bg-rose-900/60 border border-rose-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow'
                  }`}
                >
                  {isGranted ? 'Revoke' : 'Allow'}
                </button>
              </div>
            );
          })}

          {/* Privacy & Data Management Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Data & Privacy Controls</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={onClearHistory}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear History</span>
              </button>

              <button
                onClick={onClearMemories}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Wipe Memory</span>
              </button>

              <button
                onClick={onExportData}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
