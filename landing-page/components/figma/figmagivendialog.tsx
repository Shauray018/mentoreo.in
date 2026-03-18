// import { X, Calendar, Clock, CreditCard, Video, Zap, MessageCircle, Phone } from "lucide-react";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { useNavigate } from "react-router";

// interface BookingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   mentorName: string;
//   pricePerMin: number;
//   isLive?: boolean;
// }

// export function BookingModal({ isOpen, onClose, mentorName, pricePerMin, isLive = false }: BookingModalProps) {
//   const [step, setStep] = useState(1);
//   const navigate = useNavigate();
//   const [bookingMode, setBookingMode] = useState<'instant' | 'schedule'>(isLive ? 'instant' : 'schedule');
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [preferredTime, setPreferredTime] = useState<string>("");
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     if (isOpen) {
//       setBookingMode(isLive ? 'instant' : 'schedule');
//       setStep(1);
//       setSelectedDate(null);
//       setSelectedTime(null);
//       setPreferredTime("");
//       setMessage("");
//     }
//   }, [isOpen, isLive]);

//   const dates = ["Today", "Tomorrow", "Wed, 18 Mar", "Thu, 19 Mar", "Fri, 20 Mar"];
// const times = ["Morning", "Afternoon", "Evening"];

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
//           />
          
//           <motion.div 
//             initial={{ y: "100%", opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: "100%", opacity: 0 }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//             className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
//           >
//           <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
//             <div>
//               <h2 className="text-xl font-bold text-[#111827]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
//                 Connect with {mentorName}
//               </h2>
//               <p className="text-sm font-semibold text-[#6B7280]">
//                 ₹{pricePerMin}/min • Pay as you go
//               </p>
//             </div>
//             <button 
//               onClick={onClose}
//               className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="p-5 sm:p-6 overflow-y-auto">
//             {step === 1 ? (
//               <div className="space-y-6">
//                 {/* Connection Mode Selection */}
//                 {isLive && (
//                   <div className="flex bg-gray-50 p-1 rounded-2xl">
//                     <button
//                       onClick={() => setBookingMode('instant')}
//                       className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
//                         bookingMode === 'instant' 
//                           ? 'bg-white text-[#9758FF] shadow-sm' 
//                           : 'text-gray-500 hover:text-gray-700'
//                       }`}
//                     >
//                       <Zap className="w-4 h-4" />
//                       Connect Now
//                     </button>
//                     <button
//                       onClick={() => setBookingMode('schedule')}
//                       className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
//                         bookingMode === 'schedule' 
//                           ? 'bg-white text-[#9758FF] shadow-sm' 
//                           : 'text-gray-500 hover:text-gray-700'
//                       }`}
//                     >
//                       <Calendar className="w-4 h-4" />
//                       Schedule Later
//                     </button>
//                   </div>
//                 )}

//                 {bookingMode === 'schedule' ? (
//                   <>
//                     <div>
//                       <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
//                         <Calendar className="w-4 h-4" />
//                         Select Date
//                       </h3>
//                       <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
//                         {dates.map((date) => (
//                           <button
//                             key={date}
//                             onClick={() => setSelectedDate(date)}
//                             className={`px-5 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all border-2 ${
//                               selectedDate === date
//                                 ? 'border-[#9758FF] bg-[#F8F5FF] text-[#9758FF]'
//                                 : 'border-gray-100 bg-white text-gray-600 hover:border-[#E9D5FF]'
//                             }`}
//                           >
//                             {date}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
//                         <Clock className="w-4 h-4" />
//                         Available Times
//                       </h3>
//                       <div className="grid grid-cols-3 gap-2">
//                         {times.map((time) => (
//                           <button
//                             key={time}
//                             onClick={() => setSelectedTime(time)}
//                             className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
//                               selectedTime === time
//                                 ? 'border-[#9758FF] bg-[#F8F5FF] text-[#9758FF]'
//                                 : 'border-gray-100 bg-white text-gray-600 hover:border-[#E9D5FF]'
//                             }`}
//                           >
//                             {time}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {selectedTime && (
//                       <div>
//                         <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
//                           <Clock className="w-4 h-4" />
//                           Preferred Time (Optional)
//                         </h3>
//                         <input 
//                           type="time" 
//                           value={preferredTime}
//                           onChange={(e) => setPreferredTime(e.target.value)}
//                           className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#9758FF] focus:outline-none transition-all font-medium text-[#111827] bg-white"
//                         />
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <div className="py-8 text-center bg-[#F8F5FF] rounded-2xl border border-[#E9D5FF]">
//                     <div className="w-16 h-16 bg-[#9758FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Zap className="w-8 h-8 text-[#9758FF]" fill="#9758FF" />
//                     </div>
//                     <h3 className="text-lg font-bold text-[#111827] mb-2">Mentor is Live!</h3>
//                     <p className="text-[#4B5563] text-sm max-w-[250px] mx-auto">
//                       Start a chat instantly. You'll only be charged for the time you spend talking.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="bg-[#F8F5FF] p-4 rounded-2xl border border-[#E9D5FF]">
//                   <h3 className="font-bold text-[#111827] mb-1">Session Info</h3>
//                   <p className="text-sm text-[#4B5563] font-medium">
//                     {bookingMode === 'instant' ? 'Instant Connection' : `${selectedDate} at ${selectedTime} ${preferredTime ? `(${preferredTime})` : 'Slot'}`}
//                   </p>
//                   <div className="mt-4 pt-3 border-t border-[#E9D5FF] flex justify-between items-center">
//                     <span className="text-sm font-bold text-gray-500">Rate</span>
//                     <span className="text-xl font-black text-[#9758FF]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
//                       ₹{pricePerMin}/min
//                     </span>
//                   </div>
//                   <p className="text-xs text-[#6B21A8] mt-3 bg-white p-2 rounded-lg border border-[#E9D5FF]">
//                     You will only be charged based on your session's duration. Minimum wallet balance required to connect: ₹100
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <label className="text-sm font-bold text-[#111827]">
//                       Add a note for {mentorName}
//                     </label>
//                     <span className="text-xs text-gray-500 font-medium">{message.length}/100</span>
//                   </div>
//                   <textarea
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value.slice(0, 100))}
//                     placeholder="Briefly describe what you'd like to discuss... (Optional)"
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#9758FF] focus:outline-none transition-all font-medium text-[#111827] bg-white resize-none min-h-[100px]"
//                   />
//                 </div>

//                 <div className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl">
//                   <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
//                     <CreditCard className="w-5 h-5" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm font-bold text-[#111827]">Wallet Balance</p>
//                     <p className="text-xs font-semibold text-green-600">₹1,500 Available</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="p-5 sm:p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
//             {step === 1 ? (
//               <button
//                 disabled={bookingMode === 'schedule' && (!selectedDate || !selectedTime)}
//                 onClick={() => setStep(2)}
//                 className="w-full py-4 bg-[#9758FF] hover:bg-[#8B5CF6] text-white rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#9758FF]/20 active:scale-[0.98]"
//               >
//                 Continue
//               </button>
//             ) : (
//               <div className="flex gap-2 sm:gap-3">
//                 <button
//                   onClick={() => {
//                     navigate('/student/chats');
//                     onClose();
//                   }}
//                   className="flex-1 py-3 sm:py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/10 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
//                 >
//                   <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
//                   <span>Chat</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/student/chats');
//                     onClose();
//                   }}
//                   className="flex-1 py-3 sm:py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/10 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
//                 >
//                   <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
//                   <span>Call</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/student/chats');
//                     onClose();
//                   }}
//                   className="flex-1 py-3 sm:py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/10 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
//                 >
//                   <Video className="w-5 h-5 sm:w-6 sm:h-6" />
//                   <span>Video</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </div>
//       )}
//     </AnimatePresence>
//   );
// }