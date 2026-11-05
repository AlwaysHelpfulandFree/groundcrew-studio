export async function login(email, password) {
  const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const { token } = await r.json();
  localStorage.setItem('token', token);
}

export async function getBooking(id) {
  const r = await fetch(`/api/bookings/${id}?token=${localStorage.getItem('token')}`);
  return r.json();
}
