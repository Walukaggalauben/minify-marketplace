import { Redirect } from 'expo-router';
import { useSession } from '@/lib/session';

export default function SavedTab() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user) return <Redirect href="/login?next=/favorites" />;
  return <Redirect href="/favorites" />;
}
