export async function fetchApi(url: string, options: RequestInit = {}) {
  const adminUser = localStorage.getItem("admin_user");
  
  let user = null;
  try {
    if (adminUser) user = JSON.parse(adminUser);
  } catch (e) {}

  const headers = new Headers(options.headers || {});
  if (user && user.id) {
    headers.set('x-user-id', user.id.toString());
  }

  // Ensure Content-Type is set for JSON bodies if not already set
  if (options.body && !headers.has('Content-Type') && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers
  });
}
