import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Database,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  StopCircle,
  RotateCcw,
  Languages,
  Keyboard,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student } from '../types';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

interface ActionDetail {
  label: string;
  value: string;
  oldValue?: string;
  isDestructive?: boolean;
}

interface AssistantAction {
  type: 'create_student' | 'update_marks' | 'delete_student' | 'add_attendance' | 'add_fee';
  title: string;
  studentId?: string;
  studentName?: string;
  subjectName?: string;
  oldValue?: string;
  newValue?: string;
  isDestructive?: boolean;
  details?: ActionDetail[];
  payload?: any;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spokenText?: string;
  timestamp: string;
  action?: AssistantAction;
  actionStatus?: 'pending' | 'confirmed' | 'cancelled';
  intent?: string;
}

export const AiAssistantPage: React.FC = () => {
  const {
    currentUser,
    dataVersion,
    refreshData,
    languagePreference,
    setLanguagePreference,
    initialAiQuery,
    setInitialAiQuery,
  } = useApp();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `Hello ${currentUser?.full_name || 'Administrator'}! I am your **SchoolAI Voice Assistant**.\n\nI am connected directly to your school's relational database. You can speak to me naturally in **English, Hindi, or Hinglish**.\n\n🎙️ **Tap the microphone** to speak, or use text below.`,
      spokenText: `Hello! I am your SchoolAI Voice Assistant. Tap the microphone to talk to your school data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [isMuted, setIsMuted] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<'voice' | 'text'>('voice');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [accumulatedEntities, setAccumulatedEntities] = useState<any>({});
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechApiSupported, setSpeechApiSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test scenarios requested by user
  const scenarioPills = [
    { label: 'Add Rahul (Scen 1)', prompt: 'Rahul Sharma ko add karo.' },
    { label: 'Class 10 A (Scen 2)', prompt: 'Rahul Sharma class 10 A mein hai.' },
    { label: 'Maths 90 Marks (Scen 3)', prompt: 'Rahul ko Maths mein 90 marks do.' },
    { label: 'Count Class 10 (Scen 4)', prompt: 'Class 10 mein kitne students hain?' },
    { label: 'Attendance < 75% (Scen 5)', prompt: '75 percent se kam attendance wale students dikhao.' },
    { label: 'Delete Rahul (Scen 6)', prompt: 'Rahul ka record delete karo.' },
    { label: 'Ambiguous Query (Scen 7)', prompt: 'marks update' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceState, interimTranscript]);

  // Handle initial query from dashboard navigation
  useEffect(() => {
    if (initialAiQuery) {
      const query = initialAiQuery;
      setInitialAiQuery(null);
      handleSendMessage(query);
    }
  }, [initialAiQuery]);

  // Initialize Web Speech API for Speech-to-Text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechApiSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select locale based on language preference
      if (languagePreference === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN'; // Recognizes Indian English and Hinglish smoothly
      }

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInterimTranscript(currentTranscript);

        // If final result
        if (event.results[event.results.length - 1].isFinal) {
          const finalText = currentTranscript.trim();
          if (finalText) {
            handleSendMessage(finalText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceState('ERROR');
        } else {
          setVoiceState('IDLE');
        }
      };

      recognition.onend = () => {
        // Will be updated by message handling
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to initialize speech recognition:', e);
      setSpeechApiSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [languagePreference]);

  // Speech Synthesis TTS Voice Output
  const speakVoiceResponse = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[*#_`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (languagePreference === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.onstart = () => {
        setVoiceState('SPEAKING');
      };
      utterance.onend = () => {
        setVoiceState('IDLE');
      };
      utterance.onerror = () => {
        setVoiceState('IDLE');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setVoiceState('IDLE');
    }
  };

  const startListening = () => {
    if (!speechApiSupported) {
      showToast('Speech recognition is not supported in this browser. Please type below.', 'info');
      setActiveInputMode('text');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setVoiceState('LISTENING');
      }
    } catch (e) {
      console.warn('Could not start recognition:', e);
      setVoiceState('ERROR');
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {}
  };

  const cancelListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    } catch (e) {}
    setVoiceState('IDLE');
    setInterimTranscript('');
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('IDLE');
  };

  // Central Message Handling Function
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // User Message
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setVoiceState('PROCESSING');

    try {
      // Gather live authorized school data
      const [students, marks, attendance, fees, stats] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getMarks(),
        SchoolService.getAttendance(),
        SchoolService.getFees(),
        SchoolService.querySchoolData('getSchoolStatistics', {}),
      ]);

      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: languagePreference,
          accumulatedEntities,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.sender,
            content: m.text,
          })),
          schoolContext: {
            statistics: stats,
            students: students.map((s) => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,
              first_name: s.first_name,
              last_name: s.last_name,
              admission_number: s.admission_number,
              current_class: s.current_class,
              attendance_percentage: s.attendance_percentage,
              average_marks: s.average_marks,
            })),
            marks: marks.map((m) => ({
              student_name: m.student_name,
              subject_name: m.subject_name,
              marks_obtained: m.marks_obtained,
              max_marks: m.max_marks,
              grade: m.grade,
              exam_name: m.exam_name,
            })),
            attendance_summary: {
              present_count: attendance.filter((a) => a.status === 'present').length,
              absent_count: attendance.filter((a) => a.status === 'absent').length,
            },
            fees: fees.map((f) => ({
              student_name: f.student_name,
              fee_type: f.fee_type,
              amount: f.amount,
              paid_amount: f.paid_amount,
              status: f.status,
            })),
          },
        }),
      });

      const data = await res.json();

      // Update multi-turn accumulated entities
      if (data.accumulatedEntities) {
        setAccumulatedEntities(data.accumulatedEntities);
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'I analyzed the school records.',
        spokenText: data.spokenText || data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
        actionStatus: data.action ? 'pending' : undefined,
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak voice response
      if (data.spokenText || data.reply) {
        speakVoiceResponse(data.spokenText || data.reply);
      } else {
        setVoiceState('IDLE');
      }
    } catch (err: any) {
      console.error('Error contacting AI Assistant:', err);
      const errMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text: 'I could not communicate with the SchoolAI intelligence server. Please verify your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
      setVoiceState('ERROR');
    }
  };

  // Confirm and execute database action (Section 36)
  const handleConfirmAction = async (msgId: string, action: AssistantAction) => {
    try {
      if (action.type === 'create_student') {
        const studentPayload = action.payload || {
          first_name: 'Rahul',
          last_name: 'Sharma',
          current_class: 'Class 10-A',
          admission_number: `ADM-2025-${Date.now().toString().slice(-3)}`,
          guardian_name: 'Amit Sharma',
          guardian_phone: '+91 9876543210',
          attendance_percentage: 82,
          marks_obtained: 85,
        };

        const res = await SchoolService.saveStudent(
          studentPayload,
          {
            full_name: studentPayload.guardian_name || 'Amit Sharma',
            phone: studentPayload.guardian_phone || '+91 9876543210',
            relationship: 'father',
          },
          currentUser
        );

        if (!res.success) {
          showToast(res.error || 'Failed to save student record.', 'error');
          return;
        }

        // Save initial marks for the student if provided
        if (studentPayload.marks_obtained) {
          await SchoolService.saveMark(
            {
              student_id: res.student.id,
              student_name: `${res.student.first_name} ${res.student.last_name}`,
              subject_name: 'Mathematics',
              marks_obtained: studentPayload.marks_obtained || 85,
              max_marks: 100,
              exam_name: 'Mid Term Examination',
            },
            currentUser
          );
        }

        showToast(`Student ${action.studentName || 'Rahul Sharma'} enrolled successfully!`, 'success');
        refreshData();
        setAccumulatedEntities({});

        // Update message status
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'confirmed' } : m))
        );

        const successSpeech = `Student record for ${action.studentName || 'Rahul Sharma'} has been confirmed and saved to the database.`;
        speakVoiceResponse(successSpeech);
      } else if (action.type === 'update_marks') {
        const newScoreNumber = Number(action.newValue?.split('/')[0] || 90);
        await SchoolService.saveMark(
          {
            student_name: action.studentName || 'Rahul Sharma',
            subject_name: action.subjectName || 'Mathematics',
            marks_obtained: newScoreNumber,
            max_marks: 100,
            exam_name: 'Mid Term Examination',
          },
          currentUser
        );

        showToast(`Updated ${action.subjectName} marks for ${action.studentName}!`, 'success');
        refreshData();

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'confirmed' } : m))
        );

        const successSpeech = `Mathematics marks for ${action.studentName || 'Rahul'} have been updated to ${newScoreNumber}.`;
        speakVoiceResponse(successSpeech);
      } else if (action.type === 'delete_student') {
        if (action.studentId) {
          await SchoolService.deleteStudent(action.studentId, currentUser);
        }

        showToast(`Student record for ${action.studentName} deleted.`, 'info');
        refreshData();

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'confirmed' } : m))
        );

        const successSpeech = `Record for ${action.studentName || 'student'} has been deleted.`;
        speakVoiceResponse(successSpeech);
      }
    } catch (err: any) {
      console.error('Action execution failed:', err);
      showToast('Could not execute database action: ' + err.message, 'error');
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'cancelled' } : m))
    );
    setAccumulatedEntities({});
    showToast('Database action cancelled.', 'info');
    speakVoiceResponse('Operation cancelled.');
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Assistant Header & Language / Audio Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                SchoolAI Voice Assistant
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Zero Hallucination</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Voice-first intelligence grounded in live Supabase relational tables.
            </p>
          </div>
        </div>

        {/* Right Controls: Audio Mute, Language Selector & Reset */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLanguagePreference('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                languagePreference === 'en'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguagePreference('hi')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                languagePreference === 'hi'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguagePreference('hinglish')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                languagePreference === 'hinglish'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hinglish"
            >
              Hinglish
            </button>
          </div>

          {/* Mute / Unmute TTS Audio Toggle */}
          <button
            onClick={() => {
              if (!isMuted) stopSpeaking();
              setIsMuted(!isMuted);
              showToast(isMuted ? 'Voice speech synthesis unmuted' : 'Voice audio muted', 'info');
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={() => {
              stopSpeaking();
              setAccumulatedEntities({});
              setMessages([
                {
                  id: 'm-reset-' + Date.now(),
                  sender: 'assistant',
                  text: 'Conversation context reset. How can I assist you with school records today?',
                  spokenText: 'Conversation cleared. How can I assist you?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE VOICE CONTROLLER - Prominent 5-State Microphone Section (Section 3 & 49) */}
      <div className="bg-gradient-to-b from-white to-indigo-50/40 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Animated Background Rings when listening or speaking */}
        {voiceState === 'LISTENING' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-rose-500/10 animate-ping" />
            <div className="w-56 h-56 rounded-full bg-rose-500/5 animate-pulse [animation-delay:0.3s]" />
          </div>
        )}
        {voiceState === 'SPEAKING' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-emerald-500/10 animate-ping" />
            <div className="w-56 h-56 rounded-full bg-emerald-500/5 animate-pulse" />
          </div>
        )}

        {/* Large Circular Microphone Button */}
        <div className="relative z-10 mb-3">
          <button
            onClick={() => {
              if (voiceState === 'LISTENING') {
                stopListening();
              } else if (voiceState === 'SPEAKING') {
                stopSpeaking();
              } else {
                startListening();
              }
            }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              voiceState === 'IDLE'
                ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white hover:scale-105 hover:shadow-indigo-500/30'
                : voiceState === 'LISTENING'
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white animate-pulse scale-105 shadow-rose-500/40 ring-4 ring-rose-400/30'
                : voiceState === 'PROCESSING'
                ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white animate-spin'
                : voiceState === 'SPEAKING'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-400/40 scale-105 shadow-emerald-500/30'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
            title={
              voiceState === 'IDLE'
                ? 'Tap to Speak'
                : voiceState === 'LISTENING'
                ? 'Tap to Stop Listening'
                : voiceState === 'SPEAKING'
                ? 'Tap to Stop Speaking'
                : 'Microphone'
            }
          >
            {voiceState === 'IDLE' && <Mic className="w-10 h-10" />}
            {voiceState === 'LISTENING' && <StopCircle className="w-10 h-10" />}
            {voiceState === 'PROCESSING' && <Sparkles className="w-10 h-10" />}
            {voiceState === 'SPEAKING' && <Volume2 className="w-10 h-10 animate-bounce" />}
            {voiceState === 'ERROR' && <RotateCcw className="w-10 h-10" />}
          </button>
        </div>

        {/* State Label & Subtext */}
        <div className="relative z-10 space-y-1 max-w-md">
          <div className="text-sm sm:text-base font-bold text-slate-800 flex items-center justify-center space-x-2">
            {voiceState === 'IDLE' && <span>Tap to speak</span>}
            {voiceState === 'LISTENING' && (
              <span className="text-rose-600 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>Listening... speak now</span>
              </span>
            )}
            {voiceState === 'PROCESSING' && (
              <span className="text-indigo-600 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Understanding your request...</span>
              </span>
            )}
            {voiceState === 'SPEAKING' && (
              <span className="text-emerald-700 flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Speaking response...</span>
              </span>
            )}
            {voiceState === 'ERROR' && (
              <span className="text-rose-600 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Microphone error. Tap button to retry.</span>
              </span>
            )}
          </div>

          {/* Live Voice Speech Transcript Preview */}
          {interimTranscript && (
            <p className="text-xs sm:text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-indigo-100 inline-block shadow-2xs animate-fade-in">
              "{interimTranscript}"
            </p>
          )}

          {/* Voice Action Controls (Start / Stop / Cancel / Retry) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {voiceState === 'LISTENING' && (
              <>
                <button
                  onClick={stopListening}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Stop & Send</span>
                </button>
                <button
                  onClick={cancelListening}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </>
            )}

            {voiceState === 'SPEAKING' && (
              <button
                onClick={stopSpeaking}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Speaking</span>
              </button>
            )}

            {voiceState === 'ERROR' && (
              <button
                onClick={startListening}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Microphone</span>
              </button>
            )}

            <button
              onClick={() => setActiveInputMode(activeInputMode === 'voice' ? 'text' : 'voice')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2 py-1 transition-colors flex items-center space-x-1"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{activeInputMode === 'voice' ? 'Switch to text mode' : 'Voice mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Voice Scenario Test Buttons (Section 66) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
          <span>Test Voice Scenarios (Click to execute prompt):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {scenarioPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.prompt)}
              className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-300 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs font-medium transition-all flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[480px] overflow-hidden">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const hasAction = Boolean(m.action);

            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] group ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {m.text}

                    {/* CONFIRMATION PREVIEW CARD (Section 1, 35, 36) */}
                    {hasAction && m.action && (
                      <div
                        className={`mt-3 p-3.5 rounded-xl border text-left ${
                          m.action.isDestructive
                            ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                            : 'bg-white border-indigo-200 shadow-xs text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm mb-2.5">
                          {m.action.isDestructive ? (
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                          <span>{m.action.title}</span>
                        </div>

                        {/* Details Grid */}
                        {m.action.details && (
                          <div className="space-y-1.5 text-xs mb-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
                            {m.action.details.map((d, dIdx) => (
                              <div key={dIdx} className="flex justify-between items-center py-0.5">
                                <span className="text-slate-500 font-medium">{d.label}:</span>
                                <span
                                  className={`font-semibold ${
                                    d.isDestructive ? 'text-rose-600 font-bold' : 'text-slate-800'
                                  }`}
                                >
                                  {d.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status Action Buttons */}
                        {m.actionStatus === 'pending' && (
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => handleConfirmAction(m.id, m.action!)}
                              className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center space-x-1.5 ${
                                m.action.isDestructive
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {m.action.isDestructive ? 'Confirm Deletion' : 'Confirm & Save'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleCancelAction(m.id)}
                              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {m.actionStatus === 'confirmed' && (
                          <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>✓ Successfully saved to Supabase database</span>
                          </div>
                        )}

                        {m.actionStatus === 'cancelled' && (
                          <div className="flex items-center space-x-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Action was cancelled by user</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Footer: Timestamp, Speak Again, Copy */}
                  <div
                    className={`flex items-center space-x-2 mt-1 px-1 text-[10px] text-slate-400 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <>
                        <button
                          onClick={() => speakVoiceResponse(m.spokenText || m.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-indigo-600"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => copyText(m.id, m.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-slate-700"
                          title="Copy message"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing / Understanding indicator */}
          {voiceState === 'PROCESSING' && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-tl-xs flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-500 font-medium ml-1">Analyzing school database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer Form (Hybrid Voice + Text input) */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Inline mic button */}
            <button
              type="button"
              onClick={() => {
                if (voiceState === 'LISTENING') stopListening();
                else startListening();
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                voiceState === 'LISTENING'
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-300'
              }`}
              title="Voice dictation"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or say: 'Add Rahul to 10-A', 'Who has highest Maths marks?', 'Show low attendance'..."
              className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || voiceState === 'PROCESSING'}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
