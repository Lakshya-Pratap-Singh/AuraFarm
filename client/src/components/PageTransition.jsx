// PageTransition — fade + slight rise on every route change.
//
// Keys a div on location.pathname: when the path changes, React treats
// it as a brand-new DOM node and the CSS animation runs again, which is
// the lightest-weight way to get a per-route transition without adding
// an animation library. Wrap whatever renders your routed page content.
//
// Doesn't touch AppRoutes.jsx — it's rendered as a wrapper one level up,
// in whatever component sits above <AppRoutes /> (likely App.jsx),
// inside the same <BrowserRouter> so useLocation() has context.
//
// Usage:
//   <PageTransition>
//     <AppRoutes missions={missions} setMissions={setMissions} ... />
//   </PageTransition>

import { useLocation } from "react-router-dom";
import "../styles/page-transition.css";

function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

export default PageTransition;