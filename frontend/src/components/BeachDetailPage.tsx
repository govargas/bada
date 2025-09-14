import { useParams, Link } from "react-router-dom";
import BeachDetailPanel from "../components/BeachDetailPanel";

export default function BeachDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <p>Missing beach id.</p>;

  return (
    <div style={{ padding: 16 }}>
      <p>
        <Link to="/">← Back to list</Link>
      </p>
      <BeachDetailPanel id={id} />
    </div>
  );
}
