import streakLogoSrc from "../../assets/logos/streak-logo-cleaned.png";
import "./StreakLogo.css";

function StreakLogo({ className = "", size = 32, alt = "Streak logo" }) {
  return (
    <img
      src={streakLogoSrc}
      alt={alt}
      className={`streak-logo ${className}`.trim()}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}

export default StreakLogo;
