import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Nav, Footer, ChatWidget, SearchOverlay } from "./chrome.jsx";
import { Home, About, Projects, GalleryPage, Booking, Property } from "./pages.jsx";
import { TourPage } from "./three3d.jsx";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className={isHome ? "" : "subpage"}>
      <ScrollManager />
      <Nav onSearch={() => setSearchOpen(true)} />
      {/* keyed so each route cross-fades in rather than snapping */}
      <div className="page-fade" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/property/:id" element={<Property />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Footer />
      <ChatWidget />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
