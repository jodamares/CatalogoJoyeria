export default function HomePage() {
  return (
    <main>
      <section className="card">
        <h1>Backend Catalogo Joyeria listo</h1>
        <p className="muted">
          Proyecto inicializado con Next.js (App Router) para exponer APIs de autenticacion.
        </p>
        <ul>
          <li>
            Registro: <code>POST /api/auth/register</code>
          </li>
          <li>
            Login: <code>POST /api/auth/login</code>
          </li>
          <li>
            Perfil autenticado: <code>GET /api/auth/me</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
