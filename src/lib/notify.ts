import { toast } from '@/hooks/use-toast'

/** Runs an admin action and reports success or the API's error message as a toast. */
export async function withToast<T>(action: () => Promise<T>, success: string): Promise<T | undefined> {
  try {
    const result = await action()
    toast({ title: success })
    return result
  } catch (e) {
    toast({ title: 'Something went wrong', description: (e as Error).message, variant: 'destructive' })
    return undefined
  }
}
