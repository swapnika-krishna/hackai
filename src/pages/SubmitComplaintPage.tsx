import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Upload, 
  X, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  MapPin, 
  Layers, 
  HelpCircle,
  Clock,
  Shield,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { CAMPUS_BLOCKS, CAMPUS_BLOCK_LIST, CAMPUS_DEPARTMENTS_AND_DEGREES } from '../constants/campus';

interface SubmitComplaintPageProps {
  setCurrentView: (view: string) => void;
  setSelectedComplaintId: (id: string) => void;
}

export const SubmitComplaintPage: React.FC<SubmitComplaintPageProps> = ({
  setCurrentView,
  setSelectedComplaintId,
}) => {
  const { token, user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water');
  const [department, setDepartment] = useState<string>(user?.department || 'Computer Science & Engineering (CSE)');
  const [block, setBlock] = useState<string>('A Block');
  const [floor, setFloor] = useState<string>('Ground Floor');
  const [specificLocation, setSpecificLocation] = useState('Near Boys Washroom');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // When block changes, auto-adjust floor options
  const currentBlockConfig = CAMPUS_BLOCKS[block] || CAMPUS_BLOCKS['A Block'];
  const availableFloors = currentBlockConfig.floors;

  const handleBlockChange = (newBlock: string) => {
    setBlock(newBlock);
    const newConfig = CAMPUS_BLOCKS[newBlock];
    if (newConfig && !newConfig.floors.includes(floor)) {
      setFloor(newConfig.floors[0]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Duplicate Check Modal State
  const [duplicateWarning, setDuplicateWarning] = useState<Complaint[] | null>(null);
  const [bypassedDuplicateCheck, setBypassedDuplicateCheck] = useState(false);

  // Success Modal State
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size exceeds 8MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const checkDuplicatesAndSubmit = async (forceSubmit = false) => {
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for the complaint.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a detailed description of the problem.');
      return;
    }
    if (!block.trim()) {
      setError('Please specify the Building/Block.');
      return;
    }

    if (!forceSubmit && !bypassedDuplicateCheck) {
      // Check for duplicates
      try {
        const dupRes = await fetch('/api/complaints/check-duplicate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            block,
            category,
          }),
        });

        if (dupRes.ok) {
          const dupData = await dupRes.json();
          if (dupData.duplicates && dupData.duplicates.length > 0) {
            setDuplicateWarning(dupData.duplicates);
            return;
          }
        }
      } catch (err) {
        console.warn('Duplicate check skipped:', err);
      }
    }

    // Proceed to create complaint
    setIsSubmitting(true);
    setSubmitPhase('Contacting CivicMind Gemini AI Engine...');

    try {
      setTimeout(() => {
        setSubmitPhase('Analyzing severity, priority & responsible department...');
      }, 700);

      setTimeout(() => {
        setSubmitPhase('Generating unique atomic Complaint ID...');
      }, 1400);

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          department,
          location: {
            block,
            floor,
            specificLocation: specificLocation.trim() || 'General Area',
          },
          imageUrl: imagePreview || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register complaint');
      }

      setSubmittedComplaint(data.complaint);
    } catch (err: any) {
      setError(err.message || 'Submission error. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('');
    }
  };

  const handleQuickDemoWaterLeakage = () => {
    setTitle('Water leakage near A block washroom');
    setCategory('Water');
    handleBlockChange('A Block');
    setFloor('Ground Floor');
    setSpecificLocation('Near Boys Washroom');
    setDescription('There is continuous water leakage from the pipe joint near the washroom entrance and the floor is becoming very slippery. It is posing a hazard for students walking through the corridor.');
    setError(null);
  };

  const handleQuickDemoBrokenFan = () => {
    setTitle('Ceiling fan making loud noise and not rotating in Room 204');
    setCategory('Electricity');
    handleBlockChange('H Block');
    setFloor('2nd Floor');
    setSpecificLocation('Classroom 204, middle row');
    setDescription('The ceiling fan regulator seems faulty and the blades are wobbling dangerously during lectures.');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Ticket Submission
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400">
            Real-time AI Classification & SLA Allocation
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Submit a Complaint
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Describe the campus problem with precision. Gemini AI will automatically categorize, assign priority, and route it to maintenance teams.
        </p>
      </div>

      {/* Demo Quick Fill Buttons */}
      <div className="mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Hackathon Demo Templates:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleQuickDemoWaterLeakage}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            💧 Water Leakage (Block A)
          </button>
          <button
            type="button"
            onClick={handleQuickDemoBrokenFan}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
          >
            ⚡ Fan/Electrical (Room 204)
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-200">Submission Alert</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-2">
            Complaint Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="complaint-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Water leakage near Block A washroom"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            required
          />
        </div>

        {/* Category & Department/Degree Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              id="complaint-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              <option value="Water">Water & Plumbing</option>
              <option value="Electricity">Electricity & Power</option>
              <option value="Cleanliness">Cleanliness & Sanitation</option>
              <option value="Infrastructure">Infrastructure & Civil Damage</option>
              <option value="Hostel">Hostel Accommodation</option>
              <option value="Classroom">Classroom Facilities</option>
              <option value="Laboratory">Laboratory Equipment</option>
              <option value="Wi-Fi/Internet">Wi-Fi & Internet Network</option>
              <option value="Transport">Campus Transport & Bus</option>
              <option value="Canteen">Canteen & Mess Quality</option>
              <option value="Security">Security & Safety Concern</option>
              <option value="Other">Other Campus Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Department / Degree Program <span className="text-rose-400">*</span>
            </label>
            <select
              id="complaint-department-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              {CAMPUS_DEPARTMENTS_AND_DEGREES.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Building Block & Floor Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Building / Block <span className="text-rose-400">*</span>
            </label>
            <select
              id="complaint-block-select"
              value={block}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              {CAMPUS_BLOCK_LIST.map((bName) => {
                const cfg = CAMPUS_BLOCKS[bName];
                return (
                  <option key={bName} value={bName}>
                    {cfg.name} ({cfg.totalFloors} Floors)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Floor <span className="text-xs text-zinc-400 font-normal">({availableFloors.length} floors in {block})</span>
            </label>
            <select
              id="complaint-floor-select"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              {availableFloors.map((flr) => (
                <option key={flr} value={flr}>
                  {flr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Location */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-2">
            Specific Location Details
          </label>
          <input
            id="complaint-specific-location-input"
            type="text"
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
            placeholder="e.g. Near Boys Washroom, Room 204, Water Cooler"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-2">
            Complaint Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="complaint-description-input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the problem in detail. Include any safety risk, duration of the problem, and how it impacts students."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none leading-relaxed"
            required
          />
        </div>

        {/* Upload Image */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-2">
            Attach Photo of the Issue (Optional)
          </label>
          
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 max-w-sm">
              <img 
                src={imagePreview} 
                alt="Complaint Attachment Preview" 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/80 hover:bg-rose-600 text-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 mb-2 transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                Click or drag & drop to upload image
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                PNG, JPG or WEBP up to 8MB
              </span>
              <input
                id="complaint-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AI will triage category, severity, priority and assign initial SLA</span>
          </div>

          <button
            id="submit-complaint-final-btn"
            type="button"
            onClick={() => checkDuplicatesAndSubmit(false)}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                <span>{submitPhase || 'Processing...'}</span>
              </span>
            ) : (
              <>
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* DUPLICATE WARNING MODAL */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Possible Existing Complaint
                </h3>
                <p className="text-xs text-zinc-400">
                  An existing complaint may already describe this issue in this location.
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {duplicateWarning.map((dup) => (
                <div key={dup.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-1">
                    <span className="font-mono text-emerald-400 font-bold">{dup.complaintId}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{dup.status}</span>
                  </div>
                  <p className="font-semibold text-zinc-200">{dup.title}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Location: {dup.location.block}, {dup.location.floor}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetId = duplicateWarning[0].complaintId;
                  setDuplicateWarning(null);
                  setSelectedComplaintId(targetId);
                  setCurrentView('track-complaint');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                View Existing Complaint ({duplicateWarning[0].complaintId})
              </button>

              <button
                type="button"
                onClick={() => {
                  setDuplicateWarning(null);
                  setBypassedDuplicateCheck(true);
                  checkDuplicatesAndSubmit(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
              >
                Submit New Complaint Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL WITH AI ANALYSIS & UNIQUE ID */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Complaint Submitted Successfully
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your ticket has been recorded in the permanent campus ledger.
              </p>
            </div>

            {/* Complaint ID Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 mb-6 text-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1">
                Unique Complaint ID
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-wider">
                {submittedComplaint.complaintId}
              </span>
            </div>

            {/* AI Triage Findings */}
            <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800 mb-6 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[11px] pb-2 border-b border-zinc-800">
                <Sparkles className="w-3.5 h-3.5" /> Gemini AI Triage Results
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Category:</span>
                  <span className="font-semibold text-zinc-100">{submittedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Severity Level:</span>
                  <span className="font-semibold text-amber-300">{submittedComplaint.severity}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Operational Priority:</span>
                  <span className="font-semibold text-cyan-300">{submittedComplaint.priority}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Responsible Department:</span>
                  <span className="font-semibold text-zinc-100">{submittedComplaint.department}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Expected Action:</span>
                  <span className="text-zinc-200 font-medium">{submittedComplaint.estimatedActionTime}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Expected Resolution:</span>
                  <span className="text-zinc-200 font-medium">{submittedComplaint.estimatedResolutionTime}</span>
                </div>
              </div>

              {submittedComplaint.aiSummary && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">AI Briefing Summary:</span>
                  <p className="text-zinc-300 italic text-[11px] mt-0.5">"{submittedComplaint.aiSummary}"</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const cId = submittedComplaint.complaintId;
                  setSubmittedComplaint(null);
                  setSelectedComplaintId(cId);
                  setCurrentView('track-complaint');
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Track Complaint Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedComplaint(null);
                  setCurrentView('student-dashboard');
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
