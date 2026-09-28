import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) return <p>Not logged in</p>;
  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p>{user.email} | {user.role}</p>
      <p>{user.location?.state} {user.location?.district} {user.phone}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
