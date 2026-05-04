export interface WidgetUser {
  widgetUserId: string
  notionAccessToken: string
  notionWorkspaceId: string
  notionWorkspaceName: string
  notionBotId: string
  selectedDatabaseId: string
}

interface UpsertInput {
  widgetUserId: string
  notionAccessToken: string
  notionWorkspaceId: string
  notionWorkspaceName: string
  notionBotId: string
}

async function callWebhook<T>(payload: Record<string, unknown>): Promise<T> {
  const url = process.env.SHEETS_WEBHOOK_URL
  const secret = process.env.SHEETS_WEBHOOK_SECRET
  if (!url || !secret) {
    throw new Error('Sheets webhook environment variables not configured')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret }),
    redirect: 'follow',
  })

  if (!res.ok) {
    throw new Error(`Sheets webhook HTTP ${res.status}`)
  }

  const data = await res.json()
  if (data.error) {
    throw new Error(`Sheets webhook error: ${data.error}`)
  }
  return data as T
}

export async function getUser(widgetUserId: string): Promise<WidgetUser | null> {
  const data = await callWebhook<{ found: boolean } & WidgetUser>({
    action: 'get',
    widgetUserId,
  })
  if (!data.found) return null
  return {
    widgetUserId: data.widgetUserId,
    notionAccessToken: data.notionAccessToken,
    notionWorkspaceId: data.notionWorkspaceId,
    notionWorkspaceName: data.notionWorkspaceName,
    notionBotId: data.notionBotId,
    selectedDatabaseId: data.selectedDatabaseId,
  }
}

export async function upsertUser(input: UpsertInput): Promise<void> {
  await callWebhook({ action: 'upsert', ...input })
}

export async function updateSelectedDatabase(
  widgetUserId: string,
  selectedDatabaseId: string,
): Promise<void> {
  await callWebhook({
    action: 'updateSelectedDatabase',
    widgetUserId,
    selectedDatabaseId,
  })
}
