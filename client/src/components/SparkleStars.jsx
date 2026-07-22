// SparkleStars — 6 small four-point stars that fly outward on button
// hover, adapted from a reference "sparkle button" effect and recolored
// to the app's purple-gold theme (see .btn-sparkle rules in
// missions-aura.css / objectives-aura.css). Drop <SparkleStars /> as
// the last child of any button with the "btn-sparkle" class.

const STAR_PATH =
  "M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z";

// Star 2 carries the gold accent; the rest stay purple — "very little
// golden" per the app's established purple-dominant energy theme.
const STARS = [1, 2, 3, 4, 5, 6];

function SparkleStars() {
  return (
    <span className="btn-sparkle-stars" aria-hidden="true">
      {STARS.map((n) => (
        <span className={`btn-star btn-star-${n}`} key={n}>
          <svg viewBox="0 0 784.11 815.53" xmlns="http://www.w3.org/2000/svg">
            <path className="btn-star-fill" d={STAR_PATH} />
          </svg>
        </span>
      ))}
    </span>
  );
}

export default SparkleStars;