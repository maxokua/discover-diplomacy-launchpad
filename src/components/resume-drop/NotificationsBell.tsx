import { useEffect, useState } from "react";
import { listMyNotifications, markNotificationRead } from "@/lib/resume-drop.functions";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsList() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await listMyNotifications({});
    if (!("error" in res) || !res.error) {
      setItems((res.notifications as Notification[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await markNotificationRead({ data: { id } });
    load();
  }

  if (loading) return null;
  if (items.length === 0) return null;

  const unread = items.filter((i) => !i.read_at);

  return (
    <div className="border border-border bg-paper">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
          Notifications
        </div>
        {unread.length > 0 && (
          <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald">
            {unread.length} new
          </span>
        )}
      </div>
      <ul className="divide-y divide-border">
        {items.slice(0, 5).map((n) => (
          <li
            key={n.id}
            className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
              n.read_at ? "" : "bg-emerald/5"
            }`}
          >
            <div>
              <div className="font-medium text-navy-deep">{n.title}</div>
              {n.body && <div className="mt-1 text-xs text-muted-foreground">{n.body}</div>}
              {n.link && (
                <a
                  href={n.link}
                  className="mt-1 inline-block text-xs text-emerald underline"
                >
                  View
                </a>
              )}
            </div>
            {!n.read_at && (
              <button
                onClick={() => markRead(n.id)}
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
