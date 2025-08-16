import config from '../config';
import { User } from '../types';

export const getImageUrl = (path: string | null | undefined, user: User | null) => {
  const { baseURL, apiKey, apiSecret } = config;

  if (!path) {
    return `${baseURL}/assets/frappe/images/ui/avatar.png`;
  }

  const url = `${baseURL}${path}`;

  if (path.startsWith('/private/files/')) {
    if (user?.apiKey && user?.apiSecret) {
      return {
        uri: url,
        headers: {
          Authorization: `token ${user.apiKey}:${user.apiSecret}`,
        },
      };
    }
    // If user is not available, you might want to return a placeholder or handle the error
    return `${baseURL}/assets/frappe/images/ui/avatar.png`;
  }

  return { uri: url };
};
