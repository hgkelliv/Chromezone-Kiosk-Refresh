import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MOCK_DEVICES, LOANER_API_URL } from '../constants';
import { LoanerDevice, ApiAvailableResponse, ApiCheckoutResponse, ApiReturnResponse } from '../types';
import { Laptop, Battery, Check, ArrowLeft, RefreshCw, User, AlertCircle, PlugZap } from 'lucide-react';

interface LoanerSystemProps {
  onBack: () => void;
  onComplete: (message: string) => void;
}

type Step = 'selection' | 'name_input' | 'device_grid' | 'confirm' | 'return_input' | 'charger_instructions';

export const LoanerSystem: React.FC<LoanerSystemProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<Step>('selection');
  const [mode, setMode] = useState<'borrow' | 'return' | null>(null);
  
  // Data State
  const [studentName, setStudentName] = useState('');
  const [availableDevices, setAvailableDevices] = useState<LoanerDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<LoanerDevice | null>(null);
  const [returnAssetId, setReturnAssetId] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available devices when entering device_grid
  useEffect(() => {
    if (step === 'device_grid') {
      fetchDevices();
    }
  }, [step]);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    
    if (!LOANER_API_URL) {
       // Fallback to Mock if API URL is not set (for testing without setup)
       setTimeout(() => {
         setAvailableDevices(MOCK_DEVICES.filter(d => d.status === 'available'));
         setLoading(false);
       }, 500);
       return;
    }

    try {
      const response = await fetch(`${LOANER_API_URL}?action=available`);
      if (!response.ok) throw new Error("Server returned an error");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // This usually happens if the Apps Script crashes and returns an HTML error page
        throw new Error("Invalid response from loaner system");
      }

      const data: ApiAvailableResponse = await response.json();
      
      if (data.success) {
        // Map API response to LoanerDevice type
        const devices: LoanerDevice[] = data.devices.map(d => ({
          id: d.assetTag,
          name: `Chromebook ${d.assetTag}`,
          status: 'available',
          batteryLevel: Math.floor(Math.random() * 20) + 80 // Mock battery for now
        }));
        setAvailableDevices(devices);
      } else {
        setError(data.error || "Failed to load devices");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to loaner system. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (m: 'borrow' | 'return') => {
    setMode(m);
    setError(null);
    if (m === 'borrow') {
      setStep('name_input');
    } else {
      setStep('return_input');
    }
  };

  const handleNameSubmit = () => {
    if (studentName.trim().length > 2) {
      setStep('device_grid');
    } else {
      setError("Please enter your full name.");
    }
  };

  const handleDeviceSelect = (device: LoanerDevice) => {
    setSelectedDevice(device);
    setStep('confirm');
  };

  const handleConfirmBorrow = async () => {
    setLoading(true);
    setError(null);

    if (!LOANER_API_URL) {
      setTimeout(() => { setLoading(false); onComplete(`Borrowed ${selectedDevice?.id}`); }, 1000);
      return;
    }

    try {
      const url = `${LOANER_API_URL}?action=checkout&name=${encodeURIComponent(studentName)}&assetTag=${selectedDevice?.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      
      const data: ApiCheckoutResponse = await response.json();

      if (data.success) {
        onComplete(`Successfully borrowed device ${data.assetTag}`);
      } else {
        setError(data.error || "Checkout failed");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnAssetId.trim()) return;
    setLoading(true);
    setError(null);

    if (!LOANER_API_URL) {
      setTimeout(() => { setLoading(false); onComplete(`Returned ${returnAssetId}`); }, 1000);
      return;
    }

    try {
      const url = `${LOANER_API_URL}?action=return&assetTag=${encodeURIComponent(returnAssetId)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");

      const data: ApiReturnResponse = await response.json();

      if (data.success) {
        onComplete(`Successfully returned device ${data.assetTag}`);
      } else {
        setError(data.error || "Return failed. Check asset tag.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-16 h-16 text-brand-600" />
        </motion.div>
        <h3 className="mt-6 text-2xl font-bold text-slate-700">Processing Request...</h3>
        <p className="text-slate-500">Connecting to inventory database</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={step === 'selection' ? onBack : () => {
            // Back logic
            if (step === 'name_input') setStep('selection');
            else if (step === 'device_grid') setStep('name_input');
            else if (step === 'confirm') setStep('device_grid');
            else if (step === 'return_input') setStep('selection');
            else if (step === 'charger_instructions') setStep('selection');
            setError(null);
          }}
          className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        {!LOANER_API_URL && (
          <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
             DEMO MODE (No API URL)
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {step === 'selection' && (
        <div className="flex flex-col gap-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleModeSelect('borrow')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-emerald-400 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Laptop size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Check out a Loaner</h3>
                  <p className="text-slate-500">Check out a Chromebook for the day.</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleModeSelect('return')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-400 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Check size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Return Your Loaner</h3>
                  <p className="text-slate-500">Returning your loaner? Enter loaner number here.</p>
                </div>
              </motion.button>
            </div>

            {/* Charger Option */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setStep('charger_instructions')}
                className="group w-full bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-amber-400 flex items-center gap-6"
            >
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                  <PlugZap size={40} />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Get a Loaner Charger</h3>
                  <p className="text-slate-500">Borrow a power adapter for the day (Paper Form required).</p>
                </div>
            </motion.button>
        </div>
      )}

      {step === 'charger_instructions' && (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mt-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100"
         >
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
                    <PlugZap size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Loaner Charger Instructions</h2>
                <div className="w-full h-px bg-slate-100 mb-6"></div>
                <div className="text-left space-y-4 text-slate-600 text-lg leading-relaxed">
                    <p>
                        To get a loaner charger, look for a blank <strong className="text-slate-900">"Borrowed Charger Agreement"</strong> paper near this computer on the desk.
                    </p>
                    <p>
                        Follow the instructions and make sure to enter your full name and understand the agreement.
                    </p>
                    <p>
                        Once complete, look for one of the <strong className="text-amber-600">yellow loaner chargers</strong> in one of the white drawers (if there are none in the drawers then there are none available).
                    </p>
                    <p>
                        Leave your signed agreement on the desk and make sure to fill out the time you returned the charger when you return.
                    </p>
                </div>
            </div>
            
            <button
                onClick={onBack}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-transform active:scale-95"
            >
                I Understand
            </button>
         </motion.div>
      )}

      {step === 'name_input' && (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center"
         >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
               <User size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Who is borrowing?</h2>
            <p className="text-slate-500 mb-6">Please enter your full name.</p>
            
            <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                placeholder="First and Last Name"
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-4 text-center text-xl font-bold text-slate-800 mb-6 focus:outline-none transition-colors placeholder:text-slate-300"
                autoFocus
            />
            
            <button
                onClick={handleNameSubmit}
                disabled={!studentName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
                Next Step
            </button>
         </motion.div>
      )}

      {step === 'device_grid' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Select a Device</h2>
            <p className="text-white/90">Open the Loaner Chromebooks tower near this computer. Pick an available device. You will see a sticker on top of the chromebook with a number. Tap the device number that matches the sticker.</p>
          </div>
          
          {availableDevices.length === 0 ? (
             <div className="text-center p-12 bg-white/20 backdrop-blur rounded-3xl border-2 border-dashed border-slate-300">
                <p className="text-white font-medium">No devices currently available.</p>
                <p className="text-white/80 text-sm mt-2">Please check back later or see a technician.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableDevices.map((device) => (
                <motion.button
                  key={device.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeviceSelect(device)}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border-2 border-slate-100 hover:border-emerald-500 transition-all flex flex-col items-center gap-3"
                >
                  <Laptop className="text-slate-400" size={32} />
                  <span className="font-bold text-xl text-slate-800">{device.id}</span>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                      <Battery size={12} /> {device.batteryLevel > 0 ? `${device.batteryLevel}%` : 'Charged'}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && selectedDevice && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center"
        >
            <Laptop className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Checkout</h2>
            <div className="text-slate-500 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between mb-2">
                   <span className="text-sm font-medium">Borrower</span>
                   <span className="font-bold text-slate-900">{studentName}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-sm font-medium">Device</span>
                   <span className="font-bold text-slate-900">{selectedDevice.id}</span>
                </div>
            </div>

            <button
                onClick={handleConfirmBorrow}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-200 transition-transform active:scale-95 mb-3"
            >
                Yes, Borrow This Device 
            </button>
             <button
                onClick={() => setStep('device_grid')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-3 rounded-xl transition-colors"
            >
                Cancel
            </button>
        </motion.div>
      )}

      {step === 'return_input' && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-12"
        >
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                <Check className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Asset Tag</h2>
                <p className="text-slate-500 mb-6">Type the number on the silver sticker.</p>
                
                <input
                    type="text"
                    value={returnAssetId}
                    onChange={(e) => setReturnAssetId(e.target.value)}
                    placeholder="e.g. 15432"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-4 text-center text-2xl font-bold text-slate-800 mb-6 focus:outline-none transition-colors placeholder:text-slate-300"
                    autoFocus
                />
                
                <button
                    onClick={handleConfirmReturn}
                    disabled={!returnAssetId.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    Return Device
                </button>
            </div>
        </motion.div>
      )}
    </div>
  );
};
