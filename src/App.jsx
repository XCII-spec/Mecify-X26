import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "@/components/PageNotFound";

function Home() {
  return <h1>Mecify OK 🚀</h1>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
