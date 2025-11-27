import { getServerSession } from 'next-auth';
import { authOptions } from './options';

export const auth = () => getServerSession(authOptions);
export { authOptions };



