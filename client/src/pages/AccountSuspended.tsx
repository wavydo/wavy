import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, Calendar, Info, Mail, Shield, LogOut, XCircle, MessageCircle, FileText, Clock } from 'lucide-react';

interface SuspensionInfo {
  reason?: string;
  suspensionDate?: string;
  userName?: string;
}

export default function AccountSuspended() {
  const [, setLocation] = useLocation();
  const [suspensionInfo, setSuspensionInfo] = useState<SuspensionInfo>({});

  useEffect(() => {
    // Fetch suspension info from session or API
    fetchSuspensionInfo();
  }, []);

  const fetchSuspensionInfo = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setSuspensionInfo({
            reason: data.user.suspension_reason,
            suspensionDate: data.user.suspension_date,
            userName: data.user.full_name,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching suspension info:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setLocation('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support
    window.open('mailto:support@tappnetwork.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with red accent */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
            <p className="text-red-100">
              Your TAPP account has been temporarily suspended
            </p>
          </div>

          <div className="p-8">
            {/* Welcome message */}
            {suspensionInfo.userName && (
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Hello <span className="font-semibold">{suspensionInfo.userName}</span>
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Suspension Date</div>
                    <div className="text-base font-semibold text-gray-900">
                      {formatDate(suspensionInfo.suspensionDate)}
                    </div>
                  </div>
                </div>

                {suspensionInfo.reason && (
                  <div className="flex items-start gap-3 pt-4 border-t border-red-200">
                    <Info className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Reason</div>
                      <div className="text-base text-gray-900">{suspensionInfo.reason}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What This Means */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What this means</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    You cannot access your TAPP account or make transactions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    Your balance and cards are temporarily frozen
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    All pending transactions have been put on hold
                  </p>
                </div>
              </div>
            </div>

            {/* What You Can Do */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What you can do</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MessageCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    Contact our support team to resolve this issue
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    Review our terms of service and community guidelines
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-gray-700">
                    Wait for further instructions from our team
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <Mail size={20} />
                Contact Support
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <LogOut size={20} />
                Log Out
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Shield size={16} />
                <p>TAPP Network Security • Account suspensions are temporary and can be resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-blue-900">
                <strong>Need immediate assistance?</strong> Our support team is available Monday-Friday, 
                9AM-6PM EST. Response time is typically within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
