import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function IndexPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
  } else if (user.role === 'STORE_OWNER') {
    // Check if the store owner has registered a store yet
    // If not, we can redirect them to register or store dashboard (which will prompt them to register anyway)
    redirect('/store');
  } else if (user.role === 'DELIVERY_BOY') {
    redirect('/delivery');
  } else {
    redirect('/customer');
  }
}
