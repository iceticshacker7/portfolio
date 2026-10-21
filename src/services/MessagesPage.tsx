import { Loader2, Mail, MailOpen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContactMessage } from '@shared/schemas'
import { api, useApi } from '@/lib/api'
import { withToast } from '@/lib/notify'

export default function MessagesPage() {
  const { data: messages, loading, reload, setData } = useApi<ContactMessage[]>('/messages', [])

  const toggleRead = async (m: ContactMessage) => {
    setData(messages.map((x) => (x.id === m.id ? { ...x, read: !m.read } : x)))
    await api.patch(`/messages/${m.id}`, { read: !m.read }).catch(reload)
  }

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return
    if (await withToast(() => api.del(`/messages/${m.id}`), 'Message deleted')) reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Messages</h1>
      <p className="text-sm text-muted-foreground mb-4">Everything sent through the “Contact Me” form.</p>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`p-4 border rounded-md ${m.read ? 'bg-card' : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'}`}>
              <div className="flex flex-wrap items-start gap-2">
                <div className="flex-grow min-w-0">
                  <p className="font-semibold">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                    {m.email}
                  </a>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                <Button variant="ghost" size="sm" onClick={() => toggleRead(m)} aria-label={m.read ? 'Mark unread' : 'Mark read'}>
                  {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(m)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-foreground">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
