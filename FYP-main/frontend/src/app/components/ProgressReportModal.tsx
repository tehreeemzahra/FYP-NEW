import { useRef, useState } from 'react';
import { X, Download, Shield, Star, Trophy, Clock, CheckCircle, TrendingUp, Award, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportProgressReportPdf } from './exportReportPdf';

interface ProgressReportModalProps {
  onClose: () => void;
  data: ProgressReportData;
}

export interface ProgressReportData {
  childName: string;
  childAge: number;
  completedLevels: number[];
  totalScore: number;
  accuracy: number;
  gamesPlayed: GameProgress[];
  totalTimeSpent: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  reportDate: string;
}

interface GameProgress {
  gameName: string;
  levels: LevelProgress[];
  totalLevels: number;
  completed: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface LevelProgress {
  level: number;
  title: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: string;
}

export function ProgressReportModal({ onClose, data }: ProgressReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);
    setDownloadError('');

    try {
      exportProgressReportPdf(
        data,
        `CyberQuest_Progress_Report_${data.childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      );
    } catch (error) {
      console.error('Failed to export report PDF', error);
      setDownloadError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white p-4 sm:p-6 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">Progress Report</h2>
                <p className="text-white/80 text-xs sm:text-sm">Generated on {new Date(data.reportDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-60"
                title="Download PDF Report"
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {downloadError && (
            <div className="mx-4 sm:mx-6 mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{downloadError}</span>
            </div>
          )}

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div ref={reportRef} className="space-y-6 bg-white report-export-root">
            {/* Child Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">{data.childAge <= 10 ? '👧' : '🧒'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{data.childName}</h3>
                  <p className="text-gray-600">Age: {data.childAge} years old</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.completedLevels.length}</p>
                  <p className="text-xs text-gray-600">Levels Done</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.totalScore}</p>
                  <p className="text-xs text-gray-600">Total Score</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.accuracy}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.totalTimeSpent}</p>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
              </div>
            </div>

            {/* Game Progress */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Game Progress
              </h3>
              <div className="space-y-4">
                {data.gamesPlayed.map((game, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800">{game.gameName}</h4>
                        <p className="text-sm text-gray-600">{game.completed}/{game.totalLevels} levels completed</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(game.status)}`}>
                        {getStatusIcon(game.status)}
                        {game.status === 'completed' ? 'Completed' : game.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${(game.completed / game.totalLevels) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Level Details */}
                    {game.levels.length > 0 && (
                      <div className="space-y-2">
                        {game.levels.map((level, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${level.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                              {level.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                Level {level.level}: {level.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>Score: {level.score}/100</span>
                              <span>Attempts: {level.attempts}</span>
                              <span>{level.timeSpent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Key Strengths
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {data.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas for Improvement */}
            {data.areasForImprovement.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Areas for Growth
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <ul className="space-y-2">
                    {data.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recommendations for Parents
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">{index + 1}.</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}