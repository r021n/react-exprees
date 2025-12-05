import { Link } from "react-router-dom";
import { PropsWithChildren } from "react";

function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Home</Link>
        </nav>
      </header>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}

export default Layout;
