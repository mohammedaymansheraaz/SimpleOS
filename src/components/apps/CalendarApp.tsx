import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  Clock 
} from 'lucide-react';
import { sound } from '../../services/audio';

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  time: string;
  title: string;
  category: 'work' | 'personal' | 'important';
}

export const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', dateStr: new Date().toISOString().split('T')[0], time: '10:00', title: 'SimpleOS Review', category: 'work' },
    { id: '2', dateStr: new Date().toISOString().split('T')[0], time: '14:30', title: 'Design Session', category: 'important' },
  ]);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventCat, setNewEventCat] = useState<'work' | 'personal' | 'important'>('personal');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    sound.playClick();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    sound.playClick();
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    sound.playClick();
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.dateStr === selectedDateStr);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEv: CalendarEvent = {
      id: String(Date.now()),
      dateStr: selectedDateStr,
      time: newEventTime,
      title: newEventTitle.trim(),
      category: newEventCat,
    };
    setEvents([...events, newEv]);
    setNewEventTitle('');
    sound.playSuccessChime();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const isSelected = (day: number) => {
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
  };

  const hasEvents = (day: number) => {
    const dStr = new Date(year, month, day).toISOString().split('T')[0];
    return events.some(e => e.dateStr === dStr);
  };

  return (
    <div className="flex-1 flex h-full bg-[#0c0c0e] text-stone-200 font-sans select-none overflow-hidden">
      {/* Left Month View */}
      <div className="flex-1 flex flex-col p-6 border-r border-white/10 overflow-y-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-serif italic font-bold text-stone-100">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-stone-400">
              {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDate(now);
              }}
              className="px-2.5 py-1 text-xs text-stone-300 hover:text-white rounded-lg hover:bg-white/10 font-medium"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-stone-400 mb-2 font-semibold">
          {daysOfWeek.map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 min-h-[44px]" />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const today = isToday(day);
            const active = isSelected(day);
            const ev = hasEvents(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`p-2 rounded-xl text-center text-xs font-mono transition-all flex flex-col items-center justify-between min-h-[48px] relative ${
                  active 
                    ? 'bg-stone-200 text-stone-950 font-bold shadow-md' 
                    : today
                    ? 'bg-white/10 text-stone-100 font-semibold border border-white/20'
                    : 'hover:bg-white/5 text-stone-300'
                }`}
              >
                <span>{day}</span>
                {ev && (
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-stone-950' : 'bg-indigo-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Schedule & Event Panel */}
      <div className="w-80 bg-[#09090b] p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <CalendarIcon className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-100">Daily Planner</h3>
          </div>

          {/* Events List */}
          <div className="flex flex-col gap-2 mb-6">
            {dayEvents.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs italic">
                No events scheduled for this day
              </div>
            ) : (
              dayEvents.map(event => (
                <div 
                  key={event.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      event.category === 'work' ? 'bg-sky-400' :
                      event.category === 'important' ? 'bg-rose-400' : 'bg-emerald-400'
                    }`} />
                    <div>
                      <div className="text-xs font-medium text-stone-200">{event.title}</div>
                      <div className="text-[10px] font-mono text-stone-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                    className="text-stone-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Event Form */}
        <form onSubmit={handleAddEvent} className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-stone-300">Add New Event</div>
          <input
            type="text"
            placeholder="Event title..."
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-100 outline-none focus:border-stone-400"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-100 font-mono outline-none"
            />
            <select
              value={newEventCat}
              onChange={(e) => setNewEventCat(e.target.value as any)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-100 outline-none"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="important">Important</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-stone-200 hover:bg-white text-stone-950 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </form>
      </div>
    </div>
  );
};
