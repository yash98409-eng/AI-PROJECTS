import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  Edit3,
  X,
  Database,
  ArrowRight,
  User,
  Phone,
  BookOpen,
  Award,
  Calendar,
  CreditCard,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { AIStructuredEntry, Student } from '../types';

export const AiDataEntryPage: React.FC = () => {
  const {
    currentUser,
    refreshData,
    viewStudentProfile,
    languagePreference,
    setLanguagePreference,
    initialAiQuery,
    setInitialAiQuery,
  } = useApp();
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    if (initialAiQuery) {
      setInputMessage(initialAiQuery);
      setInitialAiQuery(null);
    }
  }, [initialAiQuery]);
  const [pipelineStep, setPipelineStep] = useState<
    'idle' | 'parsing' | 'validating' | 'duplicate_check' | 'preview' | 'saving' | 'success'
  >('idle');
  const [extractedData, setExtractedData] = useState<AIStructuredEntry | null>(null);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields in preview state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editClass, setEditClass] = useState('10');
  const [editSection, setEditSection] = useState('A');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editMarks, setEditMarks] = useState<Array<{ subject: string; marks_obtained: number }>>([]);
  const [editAttendance, setEditAttendance] = useState<number>(85);

  const samplePrompts = [
    'Rahul Sharma is in class 10 section A. His father is Amit Sharma and his phone number is 9876543210. Rahul got 85 in Maths and 78 in Science. His attendance is 82 percent.',
    'Rahul Sharma class 10 section A mein hai. Pita ji ka naam Amit Sharma phone 9876543210. Maths mein 85 aur Science mein 78 marks aaye. Attendance 82 percent hai.',
    'Add new student Neha Sen to Class 9-A. Mother Sunita Sen phone 9876500123. Scored 92 in English and 88 in Maths. Attendance is 95%.',
    'Vikram Malhotra enrolled in Class 10-B, guardian Deepak Malhotra 9876599881. Scored 80 in Computer Science. Paid fee 45000.',
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = languagePreference === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, [languagePreference]);

  const toggleVoiceRecording = () => {
    if (!recognitionInstance) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Speech recognition is not supported in this browser. Please type or paste your student details.', 'error');
        return;
      }
    }

    if (isListening) {
      recognitionInstance?.stop();
      setIsListening(false);
      showToast('Voice recording stopped. Review transcribed text and click Process.', 'info');
    } else {
      try {
        recognitionInstance?.start();
        setIsListening(true);
        showToast('Listening... Speak naturally in English, Hindi, or Hinglish!', 'info');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleProcessNaturalLanguage = async (textToProcess?: string) => {
    const text = textToProcess || inputMessage;
    if (!text.trim()) return;

    setIsProcessing(true);
    setPipelineStep('parsing');
    setExtractedData(null);
    setCreatedStudent(null);
    setIsEditing(false);

    try {
      const existingStudents = await SchoolService.getStudents();

      // Step 1: Send to backend server-side Gemini 3.8 Flash API
      const res = await fetch('/api/gemini/parse-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, existingStudents }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse natural language message');
      }

      setPipelineStep('validating');
      const data: AIStructuredEntry = await res.json();
      setExtractedData(data);

      // Populate edit fields
      setEditFirstName(data.entities?.student?.first_name || '');
      setEditLastName(data.entities?.student?.last_name || '');
      setEditClass(data.entities?.academic?.class || '10');
      setEditSection(data.entities?.academic?.section || 'A');
      setEditGuardianName(data.entities?.guardians?.[0]?.full_name || '');
      setEditGuardianPhone(data.entities?.guardians?.[0]?.phone || '');
      setEditMarks(data.entities?.marks || []);
      setEditAttendance(data.entities?.attendance?.percentage || 85);

      if (data.potential_duplicate) {
        setPipelineStep('duplicate_check');
      } else {
        setPipelineStep('preview');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error processing input', 'error');
      setPipelineStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSave = async (overrideAsNew: boolean = false) => {
    if (!extractedData) return;

    setPipelineStep('saving');
    try {
      const studentName = `${editFirstName} ${editLastName}`.trim() || 'Student';
      const className = `Class ${editClass}-${editSection.toUpperCase()}`;

      let existingStudentId: string | undefined = undefined;
      if (
        !overrideAsNew &&
        extractedData.potential_duplicate &&
        extractedData.intent !== 'create_student'
      ) {
        existingStudentId = extractedData.potential_duplicate.matched_student_id;
      }

      // 1. Transaction: Save Student & Guardian
      const studentResult = await SchoolService.saveStudent(
        {
          id: existingStudentId,
          first_name: editFirstName || 'Student',
          last_name: editLastName || '',
          current_class: className,
          current_section: editSection.toUpperCase(),
          attendance_percentage: editAttendance,
        },
        editGuardianName
          ? {
              full_name: editGuardianName,
              phone: editGuardianPhone,
              relationship: 'father',
            }
          : undefined,
        currentUser
      );

      if (!studentResult.success) {
        showToast(studentResult.error || 'Failed to save student. Limit reached.', 'error');
        setPipelineStep('preview');
        return;
      }

      const savedStudent = studentResult.student;
      setCreatedStudent(savedStudent);

      // 2. Transaction: Save Marks if present
      if (editMarks.length > 0) {
        for (const m of editMarks) {
          await SchoolService.saveMark(
            {
              student_id: savedStudent.id,
              student_name: `${savedStudent.first_name} ${savedStudent.last_name}`,
              subject_name: m.subject,
              marks_obtained: Number(m.marks_obtained),
              max_marks: 100,
              exam_name: 'Mid Term 2025',
            },
            currentUser
          );
        }
      }

      // 3. Transaction: Record Today's Attendance
      await SchoolService.recordAttendance(
        [
          {
            student_id: savedStudent.id,
            student_name: `${savedStudent.first_name} ${savedStudent.last_name}`,
            class_id: 'cls-10a',
            date: new Date().toISOString().split('T')[0],
            status: editAttendance >= 75 ? 'present' : 'absent',
            remarks: `Initial automated entry: ${editAttendance}% overall attendance`,
          },
        ],
        currentUser
      );

      setPipelineStep('success');
      refreshData();
      showToast(`Successfully saved records for ${savedStudent.first_name} ${savedStudent.last_name}!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Database transaction failed: ' + err.message, 'error');
      setPipelineStep('preview');
    }
  };

  const handleReset = () => {
    setInputMessage('');
    setExtractedData(null);
    setCreatedStudent(null);
    setPipelineStep('idle');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Talk to SchoolAI</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                "Talk to your school data. Manage everything with AI."
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLanguagePreference('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                languagePreference === 'en'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
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
            >
              Hinglish
            </button>
          </div>
        </div>

        {/* Visual Pipeline Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className={pipelineStep !== 'idle' ? 'text-indigo-600 font-bold' : ''}>1. User Message</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className={pipelineStep === 'parsing' ? 'text-indigo-600 font-bold animate-pulse' : pipelineStep !== 'idle' ? 'text-indigo-600' : ''}>2. AI Parsing</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className={pipelineStep === 'validating' ? 'text-indigo-600 font-bold animate-pulse' : pipelineStep !== 'idle' && pipelineStep !== 'parsing' ? 'text-indigo-600' : ''}>3. Validation</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className={pipelineStep === 'preview' || pipelineStep === 'duplicate_check' ? 'text-indigo-600 font-bold' : pipelineStep === 'saving' || pipelineStep === 'success' ? 'text-indigo-600' : ''}>4. Preview & Confirm</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className={pipelineStep === 'success' ? 'text-emerald-600 font-bold' : ''}>5. Supabase Saved</span>
          </div>
        </div>
      </div>

      {/* Input Box & Preset Chips */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Enter or Speak Student Details in Natural Language
          </label>
          <div className="flex items-center gap-2">
            {isListening && (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Listening... Speak now (Hindi / English)
              </span>
            )}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-300'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
              title="Speak naturally in Hindi, English, or Hinglish"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  Stop Voice Mic
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                  Voice Dictation (Bolo)
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type or click Voice Dictation (Bolo): 'Rahul Sharma class 10 section A mein hai. Pita ji ka naam Amit Sharma phone 9876543210. Maths mein 85 aur Science mein 78 marks aaye. Attendance 82 percent hai.'"
            className="w-full p-4 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 placeholder-slate-400 transition-all"
          />

          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button
              onClick={() => handleProcessNaturalLanguage()}
              disabled={isProcessing || !inputMessage.trim()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Process with AI</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample Prompt Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Try these real-world examples:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(prompt);
                  handleProcessNaturalLanguage(prompt);
                }}
                className="text-left text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-600 px-3 py-1.5 rounded-xl transition-all"
              >
                {prompt.slice(0, 75)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DUPLICATE DETECTION WARNING */}
      {pipelineStep === 'duplicate_check' && extractedData?.potential_duplicate && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">Possible Existing Student Found</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {extractedData.potential_duplicate.reason}
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-white/80 border border-amber-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">
                    {extractedData.potential_duplicate.matched_student_name}
                  </span>
                  <span className="text-slate-500 ml-2">
                    ({extractedData.potential_duplicate.admission_number || 'Admission Record'})
                  </span>
                </div>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {extractedData.potential_duplicate.class_name || 'Class 10-A'}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleConfirmAndSave(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Update Existing Student Record
                </button>
                <button
                  onClick={() => handleConfirmAndSave(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
                >
                  Create as Separate New Student
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURED PREVIEW & CONFIRMATION CARD */}
      {(pipelineStep === 'preview' || pipelineStep === 'saving') && extractedData && (
        <div className="bg-white rounded-2xl border-2 border-indigo-500/30 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Confidence: {Math.round((extractedData.confidence || 0.95) * 100)}% Match
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Here is what SchoolAI Understood:
              </h3>
              <p className="text-xs text-slate-500">
                Please verify the extracted schema categories before persisting to Supabase.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Fields'}</span>
            </button>
          </div>

          {/* Structured Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Personal Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Identity</span>
              </div>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First Name"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last Name"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <p className="text-base font-bold text-slate-900">
                  {editFirstName} {editLastName}
                </p>
              )}
            </div>

            {/* Academic Information */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Assignment</span>
              </div>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    placeholder="Grade"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    placeholder="Section"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <p className="text-base font-bold text-slate-900">
                  Class {editClass} – Section {editSection.toUpperCase()}
                </p>
              )}
            </div>

            {/* Guardian Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Guardian / Parent</span>
              </div>
              {isEditing ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={editGuardianName}
                    onChange={(e) => setEditGuardianName(e.target.value)}
                    placeholder="Father/Mother Full Name"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={editGuardianPhone}
                    onChange={(e) => setEditGuardianPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-900">{editGuardianName || 'None provided'}</p>
                  <p className="text-xs text-slate-500">{editGuardianPhone || 'No contact number'}</p>
                </div>
              )}
            </div>

            {/* Attendance Percentage */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Attendance</span>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={editAttendance}
                  onChange={(e) => setEditAttendance(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-slate-900">{editAttendance}%</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      editAttendance >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {editAttendance >= 75 ? 'Regular' : 'Low Attendance Alert'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Marks Breakdown */}
          {editMarks.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Extracted Academic Scores</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {editMarks.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-700">{m.subject}:</span>
                    <span className="text-xs font-extrabold text-indigo-600">{m.marks_obtained}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirmAndSave()}
              disabled={pipelineStep === 'saving'}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {pipelineStep === 'saving' ? (
                <span>Writing to Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save to Supabase</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION STATE */}
      {pipelineStep === 'success' && createdStudent && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-emerald-900">
              Information Successfully Saved to School Database!
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Record for <span className="font-bold">{createdStudent.first_name} {createdStudent.last_name}</span> (
              {createdStudent.admission_number}) in {createdStudent.current_class} has been created and verified.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => viewStudentProfile(createdStudent.id)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Open Student Profile
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors"
            >
              Add Another Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
