import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface ScheduleCalendarProps {
  sessions: ScheduledSession[];
  onJoinSession: (session: ScheduledSession) => void;
}

export default function ScheduleCalendar({ sessions, onJoinSession }: ScheduleCalendarProps) {
  const events = sessions.map(session => ({
    id: session.id,
    title: `${session.tutorial_title} with ${session.tutor_name}`,
    start: new Date(session.start_time),
    end: new Date(session.end_time),
    resource: session,
  }));

  // Custom event styles
  const eventStyleGetter = (event: any) => {
    const backgroundColor = 'hsl(var(--primary))';
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'hsl(var(--primary-foreground))',
      border: 'none',
      display: 'block',
      fontSize: '0.85em',
      fontWeight: '500' as const,
      padding: '2px 4px',
    };
    return { style };
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">My Schedule</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={(event) => onJoinSession(event.resource)}
        eventPropGetter={eventStyleGetter}
        popup
        views={['month', 'week', 'day', 'agenda']}
      />
    </div>
  );
}