import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/notificationContext';
import { Badge, Button, EmptyState, Icon, PageHeader, Tabs, statusTone } from '../../components/ui';
import { formatDateTime, timeAgo } from '../../utils/format';

const typeIcon = { success: 'checkCircle', warning: 'alert', error: 'xCircle', info: 'info' };
const typeColor = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
  info: 'bg-brand-50 text-brand-600',
};

const Item = ({ item, unread, onClick }) => {
  const body = (
    <div className="flex gap-4 px-5 py-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeColor[item.type] || typeColor.info}`}>
        <Icon name={typeIcon[item.type] || 'info'} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm ${unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{item.title}</p>
          <span className="shrink-0 text-xs text-slate-500" title={formatDateTime(item.createdAt)}>
            {timeAgo(item.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-600">{item.message}</p>
      </div>
      {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
    </div>
  );
  return (
    <li className={unread ? 'bg-brand-50/40' : ''}>
      {item.link ? (
        <Link to={item.link} onClick={onClick} className="block hover:bg-slate-50">
          {body}
        </Link>
      ) : (
        <div onClick={onClick}>{body}</div>
      )}
    </li>
  );
};

const Notifications = () => {
  const { notifications, announcements, readIds, unreadCount, markNotificationRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState('activity');

  const unreadAnnouncements = announcements.filter((a) => !readIds.includes(a._id)).length;

  return (
    <div className="page max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates about your account, vehicles and support tickets."
        actions={
          <Button variant="secondary" icon="check" onClick={markAllRead} disabled={!unreadCount}>
            Mark all as read
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'activity', label: 'Activity', count: notifications.filter((n) => !n.read).length || undefined },
            { value: 'announcements', label: 'Announcements', count: unreadAnnouncements || undefined },
          ]}
        />
      </div>

      <div className="card overflow-hidden">
        {tab === 'activity' ? (
          notifications.length === 0 ? (
            <EmptyState icon="bell" title="You're all caught up" description="We'll let you know when something needs your attention." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <Item key={n._id} item={n} unread={!n.read} onClick={() => !n.read && markNotificationRead(n._id)} />
              ))}
            </ul>
          )
        ) : announcements.length === 0 ? (
          <EmptyState icon="megaphone" title="No announcements" description="System-wide news from the administrators shows up here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.map((a) => (
              <li key={a._id} className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(a.type)} dot>
                    {a.type}
                  </Badge>
                  <span className="text-xs text-slate-500">{formatDateTime(a.createdAt)}</span>
                  {!readIds.includes(a._id) && <span className="ml-auto h-2 w-2 rounded-full bg-brand-600" />}
                </div>
                <p className="mt-2 font-medium">{a.title}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{a.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
